import dotenv from "dotenv";
dotenv.config({ path: ".env" });
dotenv.config({ path: "../.env" });
function required(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required env var: ${name}`);
    }
    return value;
}
/** CORS + redirects; production must set FRONTEND_ORIGIN explicitly. */
const frontendOrigin = process.env.FRONTEND_ORIGIN?.trim() ||
    (process.env.NODE_ENV === "production"
        ? required("FRONTEND_ORIGIN")
        : "http://localhost:3000");
export const config = {
    port: Number(process.env.PORT ?? "8080"),
    frontendOrigin,
    databaseUrl: required("DATABASE_URL"),
    sessionSecret: required("ADMIN_SESSION_SECRET"),
};
