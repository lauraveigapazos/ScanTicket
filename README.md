# ScanTicket

Aplicación web mobile-first para escanear tickets de supermercado y consultar estadísticas de gasto.
El usuario sube una foto del ticket, un OCR extrae los productos y precios, y cada producto se clasifica en una categoría.

Supermercados soportados: Mercadona, Alcampo y Froiz.

## Stack

- Backend: Spring Boot 3.3 (Java 17), Spring Security con JWT, JPA, H2 en memoria.
- Frontend: React 18 (Create React App), React Router, Tailwind 4, Recharts.
- OCR y categorización: Python con PaddleOCR y sentence-transformers.
- Correo: Mailgun (SMTP).

## Estructura

```
webapp/                      aplicación (backend + frontend)
  src/main/java/...          backend (es.udc.tfg.scanticket)
    model/entities           entidades JPA y DAOs de Spring Data
    model/services           lógica de negocio (XService + XServiceImpl)
    rest/controllers         controladores REST
    rest/dtos                DTOs y conversores
    rest/common              JWT, seguridad y mapeo de errores
  src/main/resources/
    schema.sql, data.sql     esquema y datos iniciales de la BD
    python_ocr/              OCR, parsers por supermercado y categorizador que usa la app
  frontend/                  frontend React
    src/backend/             llamadas HTTP (appFetch.js + un *Service.js por dominio)
    src/modules/app/components/{receipts,statistics,users,ui}
Paddle/, Categorization/     prototipos Python independientes (la app no los usa)
```

## Requisitos

- JDK 17 y Maven.
- Python 3 en el `PATH` como `python`, con:
  `pip install paddlepaddle paddleocr sentence-transformers pyyaml`
  (no hay versiones fijadas; la primera ejecución descarga los modelos).
- Node y Yarn solo para el modo desarrollo del frontend. Maven descarga su propio Node para compilar.

## Configuración

Copia `webapp/.env.example` a `webapp/.env` y rellena las credenciales de Mailgun y la clave JWT.
`webapp/.env` está en `.gitignore`; no lo subas al repositorio.
Todas las variables son obligatorias para arrancar el backend.

`JWT_SIGN_KEY` firma los tokens con HS512, así que necesita al menos 64 bytes. Genera una con:
`openssl rand -base64 64`

Las imágenes subidas se guardan en `~/scanticket-uploads/receipts` (`app.upload.dir` en `application.yml`).

## Ejecutar en local

1. Backend, desde `webapp/` (debe ser el directorio de trabajo, porque las rutas del OCR son relativas):
   ```
   mvn spring-boot:run -Dskip.yarn
   ```
   API en `http://localhost:8080/scanticket/api`.
2. Frontend, desde `webapp/frontend/`:
   ```
   yarn install
   yarn start
   ```
   Abre `http://localhost:3000/scanticket`. Las peticiones a la API se redirigen al puerto 8080.

La BD es H2 en memoria: se recrea en cada arranque a partir de `schema.sql` y `data.sql`.

## Tests

Desde `webapp/`:

- Todo (backend y frontend, lento): `mvn test`
- Solo backend: `mvn test -Dskip.yarn`
- Una clase: `mvn test -Dskip.yarn -Dtest=StatisticsServiceTest`

Desde `webapp/frontend/`:

- `yarn test --watchAll=false`

## Cómo funciona el OCR

`OcrServiceImpl` arranca un proceso Python de larga duración (`python_ocr/paddle_reader.py`) para cargar los modelos una sola vez.
Por cada ticket, Java escribe la ruta de la imagen en la entrada del proceso y lee una línea `RESULT {json}` de su salida.
Las peticiones se procesan de una en una. Si una tarda más de 120 s, el proceso se reinicia.
Para no arrancarlo al iniciar la app, usa `ocr.worker.preload=false`.

Para añadir un supermercado nuevo, crea un parser en `python_ocr/parsers/` a partir de `BaseReceipt` y regístralo en `parser_factory.py`.
