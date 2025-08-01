import dotenv from "dotenv"

dotenv.config()

interface EnvConfig{
    PORT : string,
    DB_URL: string,
    NODE_ENV : "development" | "production",
    JWT_ACCESS_SECRET: string,
    JWT_ACCESS_EXPIRES: string,
    BCRYPT_SALT_ROUND: string,
    SUPER_ADMIN_EMAIL:string,
    SUPER_ADMIN_PASSWORD:string,
    JWT_REFRESH_SECRET:string,
    JWT_REFRESH_EXPIRED:string,
    EXPRESS_SESSION_SECRET:string,
   
}

const loadEnvVaribles =()=>{
    const requiredEnvVariables: string[] =  ["PORT", 
    "DB_URL", 
    "NODE_ENV",
    "BCRYPT_SALT_ROUND", 
    "JWT_ACCESS_EXPIRES", 
    "JWT_ACCESS_SECRET", 
    "SUPER_ADMIN_EMAIL", 
    "SUPER_ADMIN_PASSWORD", 
    "JWT_REFRESH_SECRET", 
    "JWT_REFRESH_EXPIRED", 
    "EXPRESS_SESSION_SECRET", 

]

    requiredEnvVariables.forEach(key => {
        if(!process.env[key]){
            throw new Error(`Missing required environment variables ${key}`)
        }
    })
    return {
        PORT : process.env.PORT as string,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        DB_URL: process.env.DB_URL!,
        NODE_ENV : process.env.NODE_ENV as "development" | "production",
        JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
        JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES as string,
        BCRYPT_SALT_ROUND: process.env.BCRYPT_SALT_ROUND as string,
        SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL as string,
        SUPER_ADMIN_PASSWORD:process.env.SUPER_ADMIN_PASSWORD as string,
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
        JWT_REFRESH_EXPIRED:process.env.JWT_REFRESH_EXPIRED as string,
        EXPRESS_SESSION_SECRET:process.env.EXPRESS_SESSION_SECRET as string,
    }
}

export const envVars: EnvConfig = loadEnvVaribles()