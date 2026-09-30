package es.udc.tfg.scanticket.model.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

@Service
@Slf4j
public class OcrServiceImpl implements OcrService {

    private static final String OCR_PATH = "src/main/resources/python_ocr/paddle_reader.py";
    private static final String CONFIG_PATH = "src/main/resources/python_ocr/config.yml";
    private static final String RESULT_PREFIX = "RESULT ";
    private static final long TIMEOUT_SECONDS = 120;

    //python worker to load models only once
    private Process worker;
    private BufferedWriter toWorker;
    private BufferedReader fromWorker;
    private final ExecutorService reader = Executors.newSingleThreadExecutor();

    @Value("${ocr.worker.preload:true}")
    private boolean preload;
    
    @EventListener(ApplicationReadyEvent.class)
    public synchronized void preload() throws IOException {
        if (preload) {
            startWorker();
        }
    }

    private void startWorker() throws IOException {
        ProcessBuilder pb = new ProcessBuilder("python", OCR_PATH, CONFIG_PATH);

        pb.directory(new File(System.getProperty("user.dir")));
        pb.redirectErrorStream(true);
        //python pipes default to the OS code page (cp1252 on Windows); force UTF-8 on both ends
        pb.environment().put("PYTHONIOENCODING", "utf-8");
        worker = pb.start();

        toWorker = new BufferedWriter(new OutputStreamWriter(worker.getOutputStream(), StandardCharsets.UTF_8));
        fromWorker = new BufferedReader(new InputStreamReader(worker.getInputStream(), StandardCharsets.UTF_8));
        log.info("OCR worker started");
    }

    @PreDestroy
    public synchronized void stopWorker() {
        if (worker != null) {
            worker.destroyForcibly();
            worker = null;
        }
        reader.shutdownNow();
    }
    
    @Override
    public synchronized Map<String, Object> extractReceiptData(String imagePath) throws IOException, InterruptedException {

        try {
            if (worker == null || !worker.isAlive()) {
                startWorker();
            }

            toWorker.write(imagePath);
            toWorker.newLine();
            toWorker.flush();

            String output = reader.submit(this::readResult).get(TIMEOUT_SECONDS, TimeUnit.SECONDS);
            Map<String, Object> result = parseOcrOutput(output);

            if (result.containsKey("error")) {
                throw new RuntimeException("OCR process failed: " + result.get("error"));
            }

            return result;

        } catch (TimeoutException e) {
            stopWorkerProcess();
            log.error("OCR worker timed out", e);
            throw new RuntimeException("Failed to extract receipt data: OCR process timed out", e);
        } catch (Exception e) {
            log.error("Error during OCR extraction: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to extract receipt data: " + e.getMessage(), e);
        }
    }

    private String readResult() throws IOException {
        String line;
        while ((line = fromWorker.readLine()) != null) {
            if (line.startsWith(RESULT_PREFIX)) {
                return line.substring(RESULT_PREFIX.length());
            }
        }
        throw new IOException("OCR worker exited unexpectedly");
    }
    
    private void stopWorkerProcess() {
        worker.destroyForcibly();
        worker = null;
    }

    @Override
    public String readProcessOutput(Process process) throws IOException {

        StringBuilder output = new StringBuilder();

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }
        }
        return output.toString();
    }

    @Override
    public Map<String, Object> parseOcrOutput(String output) {

        try{
            ObjectMapper mapper = new ObjectMapper();

            try{
                return mapper.readValue(output, new TypeReference<Map<String, Object>>() {});
            }catch (JsonProcessingException  e){
                String jsonString = extractJsonFromOutput(output);
                return mapper.readValue(jsonString, new TypeReference<Map<String, Object>>() {});
            }

        }catch(JsonProcessingException e){
            throw new RuntimeException("Failed to parse OCR output: " + e.getMessage(), e);
        }
    }

    @Override
    public String extractJsonFromOutput(String output) {

        int startIndex = output.indexOf('{');
        int endIndex = output.lastIndexOf('}');

        if (startIndex != -1 && endIndex != -1 && endIndex > startIndex) {
            return output.substring(startIndex, endIndex + 1);
        }

        throw new RuntimeException("No JSON found in OCR output");
    }
}
