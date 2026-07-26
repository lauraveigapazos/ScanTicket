package es.udc.tfg.scanticket.model.services;

import java.io.IOException;
import java.util.Map;

public interface OcrService {

    Map<String, Object> extractReceiptData(String imagePath)
            throws IOException, InterruptedException;

    String readProcessOutput(Process process) throws IOException;

    Map<String, Object> parseOcrOutput(String output);

    String extractJsonFromOutput(String output);
}
