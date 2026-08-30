package es.udc.tfg.scanticket.model.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class OcrServiceImpl implements OcrService {

    private static final String OCR_PATH = "src/main/resources/python_ocr/paddle_reader.py";
    private static final String CONFIG_PATH = "src/main/resources/python_ocr/config.yml";
    @Override
    public Map<String, Object> extractReceiptData(String imagePath) throws IOException, InterruptedException {

        try {
            ProcessBuilder pb = new ProcessBuilder(
                    "python",
                    OCR_PATH,
                    imagePath,
                    CONFIG_PATH
            );

            pb.directory(new File(System.getProperty("user.dir")));
            pb.redirectErrorStream(true);
            Process process = pb.start();

            String output = readProcessOutput(process);

            boolean completed = process.waitFor(30, TimeUnit.SECONDS);
            if (!completed){
                process.destroyForcibly();
                throw new RuntimeException("OCR process timed out");
            }

            int exitCode = process.exitValue();
            if (exitCode != 0){
                throw new RuntimeException(
                        "OCR process failed with exit code: " + exitCode +
                                "\nPython output:\n" + output
                );
            }

            return parseOcrOutput(output);

        } catch (Exception e) {
            log.error("Error during OCR extraction: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to extract receipt data: " + e.getMessage(), e);
        }
    }

    @Override
    public String readProcessOutput(Process process) throws IOException {

        StringBuilder output = new StringBuilder();

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(process.getInputStream()))) {
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
