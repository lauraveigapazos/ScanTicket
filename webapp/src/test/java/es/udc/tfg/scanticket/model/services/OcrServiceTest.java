package es.udc.tfg.scanticket.model.services;

import lombok.extern.slf4j.Slf4j;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import java.io.*;
import java.util.Map;

import static org.junit.Assert.*;

@RunWith(SpringRunner.class)
@SpringBootTest
@ActiveProfiles("test")
@Slf4j
public class OcrServiceTest {

    @Autowired
    private OcrService ocrService;

    @Test
    public void testParseOcrOutput_ValidJson(){

        String jsonOutput = "{\"store\": \"Froiz\", \"total\": 25.50, \"items\": []}";

        Map<String, Object> result = ocrService.parseOcrOutput(jsonOutput);

        assertNotNull(result);
        assertEquals("Froiz", result.get("store"));
        assertEquals(25.50, result.get("total"));
    }

    @Test
    public void testParseOcrOutput_JsonWithDebugText(){

        String output = "Processing image...\n" +
                "Found store: Froiz\n" +
                "Found 3 items\n" +
                "{\"store\": \"Froiz\", \"total\": 25.50}";

        Map<String, Object> result = ocrService.parseOcrOutput(output);

        assertNotNull(result);
        assertEquals("Froiz", result.get("store"));
        assertEquals(25.50, result.get("total"));
    }

    @Test(expected = RuntimeException.class)
    public void testParseOcrOutput_InvalidJson(){

        String invalidOutput = "This is not JSON at all";

        ocrService.parseOcrOutput(invalidOutput);
    }

    @Test
    public void testExtractJsonFromOutput_Success(){

        String output = "Processing...\n{\"store\": \"Test\"}\nDone!";

        String json = ocrService.extractJsonFromOutput(output);

        assertNotNull(json);
        assertEquals("{\"store\": \"Test\"}", json);
    }

    @Test
    public void testExtractJsonFromOutput_ComplexJson(){

        String output = "Start\n{\"store\": \"Test\", \"items\": [{\"name\": \"item1\"}]}\nEnd";

        String json = ocrService.extractJsonFromOutput(output);

        assertNotNull(json);
        assertTrue(json.contains("\"store\""));
        assertTrue(json.contains("\"items\""));
    }

    @Test(expected = RuntimeException.class)
    public void testExtractJsonFromOutput_NoJson(){

        String output = "No JSON here";

        ocrService.extractJsonFromOutput(output);
    }

    @Test
    public void testReadProcessOutput_Success() throws IOException{

        String testOutput = "Line 1\nLine 2\nLine 3";
        Process process = createMockProcess(testOutput);

        String result = ocrService.readProcessOutput(process);

        assertNotNull(result);
        assertTrue(result.contains("Line 1"));
        assertTrue(result.contains("Line 2"));
        assertTrue(result.contains("Line 3"));
    }

    @Test
    public void testParseOcrOutput_CompleteReceipt(){

        String jsonOutput = "{\n" +
                "  \"store\": \"Froiz\",\n" +
                "  \"store_cif\": \"A36036739\",\n" +
                "  \"date\": \"2025-10-31\",\n" +
                "  \"time\": \"14:11:00\",\n" +
                "  \"address\": \"Avda. De Oza, 16\",\n" +
                "  \"phone_number\": \"981173354\",\n" +
                "  \"items\": [\n" +
                "    {\n" +
                "      \"name\": \"Pila Froiz\",\n" +
                "      \"quantity\": 1,\n" +
                "      \"unit\": \"ud\",\n" +
                "      \"unit_price\": 1.0,\n" +
                "      \"total_price\": 1.0,\n" +
                "      \"category\": \"drogueria\",\n" +
                "      \"tax\": \"21%\"\n" +
                "    }\n" +
                "  ],\n" +
                "  \"subtotal\": null,\n" +
                "  \"tax_amount\": null,\n" +
                "  \"total\": 3.58,\n" +
                "  \"payment_method\": \"Tarjeta\"\n" +
                "}";

        Map<String, Object> result = ocrService.parseOcrOutput(jsonOutput);

        assertNotNull(result);
        assertEquals("Froiz", result.get("store"));
        assertEquals("A36036739", result.get("store_cif"));
        assertEquals("2025-10-31", result.get("date"));
        assertEquals("14:11:00", result.get("time"));
        assertEquals(3.58, result.get("total"));
        assertEquals("Tarjeta", result.get("payment_method"));
        assertNotNull(result.get("items"));
    }

    //helper method
    private Process createMockProcess(String output) throws IOException{

        return new Process() {
            private final InputStream inputStream = new ByteArrayInputStream(output.getBytes());
            private boolean isAlive = true;

            @Override
            public OutputStream getOutputStream() {
                return new ByteArrayOutputStream();
            }

            @Override
            public InputStream getInputStream() {
                return inputStream;
            }

            @Override
            public InputStream getErrorStream() {
                return new ByteArrayInputStream(new byte[0]);
            }

            @Override
            public int waitFor() throws InterruptedException {
                isAlive = false;
                return 0;
            }

            @Override
            public int exitValue() {
                return 0;
            }

            @Override
            public void destroy() {
                isAlive = false;
            }
        };
    }
}
