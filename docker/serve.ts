const DIST_DIR = process.env.DIST_DIR ?? "./dist"
const PORT = Number(process.env.PORT ?? 80)
const HOST = process.env.HOST ?? "0.0.0.0"

const IMMUTABLE_PATTERN = /\.(?:css|js|woff2?|ttf|eot|ico|svg)$/i
const GZIP_MIN_BYTES = 256
const GZIP_TYPES = [
    "text/",
    "application/javascript",
    "application/json",
    "image/svg+xml",
]

const indexFile = Bun.file(`${DIST_DIR}/index.html`)

function isCompressible(mimeType: string): boolean {
    return GZIP_TYPES.some((type) =>
        type.endsWith("/") ? mimeType.startsWith(type) : mimeType === type,
    )
}

function resolveFilePath(pathname: string): string | null {
    const relative = pathname.replace(/^\/+/, "")

    if (
        relative.includes("..") ||
        relative.includes("\\") ||
        relative.includes("\0")
    ) {
        return null
    }

    return relative.length > 0 ? `${DIST_DIR}/${relative}` : `${DIST_DIR}/index.html`
}

Bun.serve({
    hostname: HOST,
    port: PORT,
    async fetch(req) {
        const pathname = decodeURIComponent(new URL(req.url).pathname)
        const filePath = resolveFilePath(pathname)

        if (!filePath) {
            return new Response("Not Found", { status: 404 })
        }

        let file = Bun.file(filePath)

        if (!(await file.exists())) {
            if (pathname.includes(".")) {
                return new Response("Not Found", { status: 404 })
            }

            file = indexFile
        }

        const headers: Record<string, string> = {}

        if (IMMUTABLE_PATTERN.test(pathname)) {
            headers["Cache-Control"] = "public, max-age=604800, immutable"
        }

        const acceptEncoding = req.headers.get("accept-encoding") ?? ""

        if (
            acceptEncoding.includes("gzip") &&
            file.size >= GZIP_MIN_BYTES &&
            isCompressible(file.type)
        ) {
            const gz = Bun.gzipSync(await file.arrayBuffer())

            headers["Content-Encoding"] = "gzip"
            headers["Content-Type"] = file.type
            headers["Content-Length"] = String(gz.byteLength)

            return new Response(gz, { headers })
        }

        return new Response(file, { headers })
    },
})

console.log(`Serving ${DIST_DIR} on http://${HOST}:${PORT}`)
