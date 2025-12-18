import https from "https";
import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy API route to upload files to S3 presigned URLs
 * This bypasses SSL certificate errors that occur in the browser
 *
 * @param request - Next.js request object containing the file and presigned URL
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const presignedUrl = formData.get("presignedUrl") as string;

    if (!file || !presignedUrl) {
      return NextResponse.json({ error: "Missing file or presignedUrl" }, { status: 400 });
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse the presigned URL
    const url = new URL(presignedUrl);

    // Check which headers are signed
    const signedHeadersParam = url.searchParams.get("X-Amz-SignedHeaders");
    const signedHeaders = signedHeadersParam
      ? signedHeadersParam
          .split(/[;\s]+/)
          .map((h) => h.toLowerCase().trim())
          .filter((h) => h)
      : [];

    // Build headers - only include headers that are in the signature
    const headers: Record<string, string> = {};
    const hasContentTypeInSignature = signedHeaders.some((h) => h.toLowerCase() === "content-type");

    if (hasContentTypeInSignature) {
      headers["Content-Type"] = file.type || "application/octet-stream";
    }

    // Make the request to S3 using Node.js https module
    // This allows us to ignore SSL certificate errors in development
    return new Promise((resolve, reject) => {
      const urlObj = new URL(presignedUrl);
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || 443,
        path: urlObj.pathname + urlObj.search,
        method: "PUT",
        headers: {
          ...headers,
          "Content-Length": buffer.length,
        },
        // In development, we can ignore SSL certificate errors
        // In production, this should be removed and the certificate should be fixed
        rejectUnauthorized: process.env.NODE_ENV === "production",
      };

      const req = https.request(options, (res) => {
        const chunks: Buffer[] = [];

        res.on("data", (chunk) => {
          chunks.push(chunk);
        });

        res.on("end", () => {
          const responseBody = Buffer.concat(chunks).toString();

          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(
              NextResponse.json(
                {
                  success: true,
                  status: res.statusCode,
                  message: "File uploaded successfully",
                },
                { status: 200 }
              )
            );
          } else {
            resolve(
              NextResponse.json(
                {
                  error: "Upload failed",
                  status: res.statusCode,
                  message: responseBody || res.statusMessage,
                },
                { status: res.statusCode || 500 }
              )
            );
          }
        });
      });

      req.on("error", (error) => {
        reject(
          NextResponse.json(
            { error: "Network error during upload", message: error.message },
            { status: 500 }
          )
        );
      });

      // Write the file buffer to the request
      req.write(buffer);
      req.end();
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
