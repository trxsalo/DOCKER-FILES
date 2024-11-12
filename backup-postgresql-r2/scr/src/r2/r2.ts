import {
    CopyObjectCommand, CreateBucketCommand, DeleteBucketCommand,
    DeleteObjectCommand,
    GetBucketCorsCommand,
    GetBucketEncryptionCommand,
    GetBucketLocationCommand,
    GetObjectCommand, GetObjectCommandOutput,
    HeadBucketCommand,
    HeadObjectCommand, ListBucketsCommand,
    ListObjectsCommand,
    PutObjectCommand, S3Client,
    type S3Client as R2,
} from '@aws-sdk/client-s3';
import {Upload, type Progress} from '@aws-sdk/lib-storage';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';
import {Readable} from 'stream';
import {type ReadStream} from 'fs';
import * as stream from "node:stream";

export class ClassR2 {

    private  region: string;
    private  endpoint: string;
    private  accessKeyId: string;
    private  secretAccessKey: string;
    private  r2: S3Client;

    constructor
    ({endpoint,region,accessKeyId,secretAccessKey}:
         {endpoint:string ,region:string,accessKeyId:string,secretAccessKey:string}) {
        this.endpoint = endpoint;
        this.region = region;
        this.accessKeyId = accessKeyId;
        this.secretAccessKey = secretAccessKey;

        this.r2 = new S3Client({
            region: this.region,
            endpoint: this.endpoint,
            credentials: {
                accessKeyId: this.accessKeyId,
                secretAccessKey: this.secretAccessKey
            },
            forcePathStyle: true
        });

    }

    /**
     * Returns a `Bucket` object that represents the specified storage bucket.
     * @param bucketName The name of the storage bucket.
     * @returns A `Bucket` object that represents the specified storage bucket.
     */
    public bucket(bucketName: string): Bucket {
        return new Bucket(this.r2, bucketName, this.endpoint);
    }
    /**
     * Returns a list of all buckets owned by the authenticated sender of the request.
     * @async
     */
    public async listBuckets(): Promise<BucketList> {
        const result = await this.r2.send(new ListBucketsCommand({}));
        const buckets =
            result.Buckets?.map((bucket:any) => {
                return {
                    name: bucket.Name,
                    creationDate: bucket.CreationDate,
                };
            }) || [];
        const owner = {
            id: result.Owner?.ID,
            displayName: result.Owner?.DisplayName,
        };
        return { buckets, owner };
    }
    /**
     * Determines if a bucket exists and you have permission to access it.
     * @async
     * @param bucketName
     */
    public async bucketExists(bucketName: string): Promise<boolean> {
        return await this.bucket(bucketName).exists();
    }

    /**
     * Create a new R2 bucket and returns `Bucket` object.
     * @async
     * @param bucketName
     */
    public async createBucket(bucketName: string): Promise<Bucket> {
        await this.r2.send(
            new CreateBucketCommand({
                Bucket: bucketName,
            })
        );

        return new Bucket(this.r2, bucketName, this.endpoint);
    }

    /**
     * Delete an existing bucket. Returns true if success or throws error if fail.
     * @async
     * @param bucketName
     */
    public async deleteBucket(bucketName: string): Promise<boolean> {
        const result = await this.r2.send(
            new DeleteBucketCommand({
                Bucket: bucketName,
            })
        );

        return result.$metadata.httpStatusCode === 204;
    }

    /**
     * Returns Cross-Origin Resource Sharing (CORS) policies of the bucket.
     * @async
     */
    public async getBucketCors(bucketName: string): Promise<CORSPolicy[]> {
        return await this.bucket(bucketName).getCors();
    }

    /**
     * Returns the region the bucket resides in. For `Cloudflare R2`, the region is always `auto`.
     * @async
     * @param bucketName
     */
    public async getBucketRegion(bucketName: string): Promise<string> {
        return await this.bucket(bucketName).getRegion();
    }
}


export class Bucket {
    private r2: R2;
    private endpoint: string;
    private bucketPublicUrls: string[] = [];

    /**
     * Name of the bucket.
     * @readonly
     */
    public readonly name: string;

    /**
     * URI of the bucket.
     * @readonly
     */
    public readonly uri: string;

    /**
     * Instantiate `Bucket`.
     * @param r2 R2 instance.
     * @param bucketName Name of the bucket.
     * @param endpoint Cloudflare R2 base endpoint.
     * @param domain Cloudflare R2 bucket URL domain.
     */
    constructor(r2: R2,
                bucketName: string,
                endpoint: string,
                domain?:string) {
        this.r2 = r2;
        this.name = bucketName;
        this.endpoint = new URL(endpoint).origin;
        this.uri = `${domain}`;
    }

    get getR2() {
        return this.r2;
    }

    /**
     * Returns the name of the current bucket.
     */
    public getBucketName(): string {
        return this.name;
    }

    /**
     * Returns the URI for the current bucket.
     */
    public getUri(): string {
        return this.uri;
    }

    public provideBucketPublicUrl(bucketPublicUrl: string): this;
    public provideBucketPublicUrl(bucketPublicUrls: string[]): this;

    /**
     * Sets the public URL for the current bucket. If public access to the bucket is allowed, use this method to provide bucket public URL to this `Bucket` object.
     * @param bucketPublicUrl The public URL of the current bucket.
     * @note If public access to the bucket is not allowed, the public URL set by this method will not be accessible to the public. Invoking this function will not have any effect on the security or access permissions of the bucket.
     */
    public provideBucketPublicUrl(bucketPublicUrl: string | string[]): this {
        if (typeof bucketPublicUrl === 'string') {
            const origin = new URL(bucketPublicUrl).origin;
            if (!this.bucketPublicUrls.includes(origin)) this.bucketPublicUrls.push(origin);
        } else if (Array.isArray(bucketPublicUrl)) {
            for (const url of bucketPublicUrl) {
                this.provideBucketPublicUrl(url);
            }
        }

        return this;
    }


    /**
     * Returns all public URLs of the bucket if it's set with `provideBucketPublicUrl()` method.
     */
    public getPublicUrls(): string[] {
        return this.bucketPublicUrls;
    }

    /**
     * Returns the signed URL of an object. This method does not check whether the object exists or not.
     * @param objectKey
     * @param expiresIn Expiration time in seconds.
     */
    public async getObjectSignedUrl(objectKey: string, expiresIn: number): Promise<string> {
        const obj = new GetObjectCommand({
            Bucket: this.name,
            Key: objectKey,
        });
        //@ts-ignore
        const signedUrl = await getSignedUrl(this.r2, obj, {expiresIn});
        return signedUrl;
    }

    public async getObject(objectKey: string): Promise<GetObjectCommandOutput> {

        const obj = await this.r2.send(new GetObjectCommand({
            Bucket: this.name,
            Key: objectKey,
        }));

        return obj

    }

    /**
     * Generates object public URL if the bucket public URL is set with `provideBucketPublicUrl` method.
     * @param objectKey
     */
    protected generateObjectPublicUrl(objectKey: string): string | null {
        if (!this.bucketPublicUrls.length) return null;

        return `${this.bucketPublicUrls.at(0)}/${objectKey}`;
    }

    /**
     * Generates object public URLs if the bucket public URL is set with `provideBucketPublicUrl` method.
     * @param objectKey
     */
    protected generateObjectPublicUrls(objectKey: string): Array<string> {
        if (!this.bucketPublicUrls.length) return [];

        return this.bucketPublicUrls.map((publicUrl) => `${publicUrl}/${objectKey}`);
    }

    /**
     * Returns all public URL of an object in the bucket.
     * @param objectKey
     */
    public getObjectPublicUrls(objectKey: string): string[] {
        return this.bucketPublicUrls.map((bucketPublicUrl) => `${bucketPublicUrl}/${objectKey}`);
    }

    /**
     * Checks if the bucket exists and you have permission to access it.
     * @param bucketName
     */
    public async exists(): Promise<boolean> {
        try {
            const result = await this.r2.send(
                new HeadBucketCommand({
                    Bucket: this.name,
                })
            );

            return result.$metadata.httpStatusCode === 200;
        } catch {
            return false;
        }
    }

    /**
     * **DEPRECATED. This method will be remove in the next major version. Use `getCorsPolicies()` instead.**
     *
     * Returns Cross-Origin Resource Sharing (CORS) policies of the bucket.
     * @deprecated
     */
    public async getCors(): Promise<CORSPolicy[]> {
        return this.getCorsPolicies();
    }

    /**
     * Returns Cross-Origin Resource Sharing (CORS) policies of the bucket.
     */
    public async getCorsPolicies(): Promise<CORSPolicy[]> {
        try {
            const result = await this.r2.send(
                new GetBucketCorsCommand({
                    Bucket: this.name,
                })
            );

            const corsPolicies =
                result.CORSRules?.map((rule:any) => {
                    const {
                        AllowedHeaders: allowedHeaders,
                        AllowedMethods: allowedMethods,
                        AllowedOrigins: allowedOrigins,
                        ExposeHeaders: exposeHeaders,
                        ID: id,
                        MaxAgeSeconds: maxAgeSeconds,
                    } = rule;
                    return {
                        allowedHeaders,
                        allowedMethods,
                        allowedOrigins,
                        exposeHeaders,
                        id,
                        maxAgeSeconds,
                    };
                }) || [];

            return corsPolicies;
        } catch {
            return [];
        }
    }

    /**
     * Returns the region the bucket resides in.
     * @param bucketName
     */
    public async getRegion() {
        const result = await this.r2.send(
            new GetBucketLocationCommand({
                Bucket: this.name,
            })
        );
        return result.LocationConstraint || 'auto';
    }

    /**
     * Returns the encryption configuration of the bucket.
     */
    public async getEncryption() {
        const result = await this.r2.send(
            new GetBucketEncryptionCommand({
                Bucket: this.name,
            })
        );

        const rules =
            result.ServerSideEncryptionConfiguration?.Rules?.map((rule:any) => {
                return {
                    applyServerSideEncryptionByDefault: {
                        sseAlgorithm: rule.ApplyServerSideEncryptionByDefault?.SSEAlgorithm,
                        kmsMasterKeyId: rule.ApplyServerSideEncryptionByDefault?.KMSMasterKeyID,
                    },
                    bucketKeyEnabled: rule.BucketKeyEnabled,
                };
            }) || [];

        return rules;
    }


    /**
     * Upload an object to the bucket.
     * @param contents The object contents to upload.
     * @param destination The name of the file to put in the bucket. If `destination` contains slash character(s), this will put the file inside directories. If the file already exists in the bucket, it will be overwritten.
     * @param customMetadata Custom metadata to set to the uploaded file.
     * @param mimeType Optional mime type. (Default: `application/octet-stream`)
     */
    public async upload(
        {contents, destination, customMetadata, mimeType}: {
            contents: Blob
            destination: string,
            customMetadata?: Record<string, string>,
            mimeType?: TYPE_FILE
        }
    ): Promise<UploadFileResponse> {
        destination = destination.startsWith('/') ? destination.replace(/^\/+/, '') : destination;

        // Generar un nombre único para el objeto subido
        const name_uuid = f_uuid();
        // Obtener la fecha actual para agrupar los objetos en carpetas
        const today = new Date();
        const name_carpeta = `${today.getFullYear()}_${today.getMonth() + 1}_${today.getDate()}`;
        // Obtener la extensión del archivo de manera más robusta
        //@ts-ignore
        const fileExtension = contents.name.split('.').pop();
        // Construir la clave (ruta) del objeto
        const key = `${destination}/${name_carpeta}/${name_uuid}.${fileExtension}`;

        const file = Buffer.from(await contents.arrayBuffer()); // Convierte a Buffer desde arrayBuffer

        const result = await this.r2.send(
            new PutObjectCommand({
                Bucket: this.name,
                Key: key,
                Body: file,
                ContentType: contents.type,
                Metadata: customMetadata,
            })
        );

        return {
            objectKey: key,
            uri: `${this.uri}/${key}`,
            publicUrl: this.generateObjectPublicUrl(destination),
            publicUrls: this.generateObjectPublicUrls(destination),
            etag: result.ETag,
            versionId: result.VersionId,
        };
    }

    public async uploadBuffer(
        {
            contents,
            destination,
            customMetadata,
            mimeType
        }: {
            contents: Blob | Buffer;
            destination: string;
            customMetadata?: Record<string, string>;
            mimeType?: TYPE_FILE;
        }
    ): Promise<UploadFileResponse> {
        // Eliminar cualquier barra inicial en el nombre del destino
        destination = destination.startsWith('/') ? destination.replace(/^\/+/, '') : destination;

        // Generar un nombre único para el objeto subido
        const nameUuid = f_uuid();

        // Obtener la fecha actual para agrupar los objetos en carpetas
        const today = new Date();
        const nameFolder = `${today.getFullYear()}_${today.getMonth() + 1}_${today.getDate()}`;

        // Obtener la extensión del archivo, si está disponible
        const fileExtension = mimeType ? mimeType.split('/').pop() : 'bin';

        // Construir la clave (ruta) del objeto
        const key = `${destination}/${nameFolder}/${nameUuid}.${fileExtension}`;

        // Convertir el contenido a un `Buffer` si es `Blob`
        let fileBuffer: Buffer;
        if (contents instanceof Blob) {
            fileBuffer = Buffer.from(await contents.arrayBuffer());
        } else {
            fileBuffer = contents;
        }

        // Subir el archivo al bucket
        const result = await this.r2.send(
            new PutObjectCommand({
                Bucket: this.name,
                Key: key,
                Body: fileBuffer,
                ContentType: mimeType || 'application/octet-stream',
                Metadata: customMetadata,
            })
        );

        return {
            objectKey: key,
            uri: `${this.uri}/${key}`,
            publicUrl: this.generateObjectPublicUrl(key),
            publicUrls: this.generateObjectPublicUrls(key),
            etag: result.ETag,
            versionId: result.VersionId,
        };
    }


    /**
     * Upload an object or stream to the bucket. This is a new method to put object to the bucket using multipart upload.
     * @param contents The object contents to upload.
     * @param destination The name of the file to put in the bucket. If `destination` contains slash character(s), this will put the file inside directories. If the file already exists in the bucket, it will be overwritten.
     * @param customMetadata Custom metadata to set to the uploaded file.
     * @param mimeType Optional mime type. (Default: `application/octet-stream`)
     * @param onProgress A callback to handle progress data.
     */
    public async uploadStream(
        contents: string | Uint8Array | Buffer | Readable | ReadStream,
        destination: string,
        customMetadata?: Record<string, string>,
        mimeType?: string,
        onProgress?: (progress: Progress) => void
    ): Promise<UploadFileResponse> {
        destination = destination.startsWith('/') ? destination.replace(/^\/+/, '') : destination;

        const upload = new Upload({
            //@ts-ignore
            client: this.r2,
            params: {
                Bucket: this.name,
                Key: destination,
                Body: contents,
                ContentType: mimeType || 'application/octet-stream',
                Metadata: customMetadata,
            },
        });

        if (onProgress) upload.on('httpUploadProgress', (progress:any) => onProgress(progress));

        const result = await upload.done();

        return {
            objectKey: destination,
            uri: `${this.uri}/${destination}`,
            publicUrl: this.generateObjectPublicUrl(destination),
            publicUrls: this.generateObjectPublicUrls(destination),
            etag: result.ETag,
            versionId: result.VersionId,
        };
    }

    /**
     * Deletes an object in the bucket.
     * @param objectKey
     */
    public async deleteObject(objectKey: string): Promise<boolean | Error> {
        try {
            // Verificar si el objeto existe antes de intentar eliminarlo
            const objectExists = await this.objectExists(objectKey);

            if (!objectExists) {
                return new Error(`El archivo con la clave "${objectKey}" no existe en el bucket.`);
            }

            // Eliminar el objeto
            const result = await this.r2.send(
                new DeleteObjectCommand({
                    Bucket: this.name,
                    Key: objectKey,
                })
            );

            //@ts-ignore
            if (!(result.$metadata.httpStatusCode >= 200 && result.$metadata.httpStatusCode < 300)) {
                return new Error(`Error al eliminar el objeto con la clave "${objectKey}".`);
            }

            // Verificar nuevamente si el objeto fue eliminado correctamente
            const stillExists = await this.objectExists(objectKey);

            if (stillExists) {
                return new Error(`El objeto con la clave "${objectKey}" aún existe en el bucket después de intentar eliminarlo.`);
            }

            return true;
        } catch (err) {

            return new Error("Error en el proceso de eliminación:");
        }
    }


    /**
     * Verifica si un objeto existe en el bucket.
     * @param objectKey - Clave del objeto a verificar.
     * @returns {Promise<boolean>} - Retorna `true` si el objeto existe, `false` en caso contrario.
     */
    public async objectExists(objectKey: string): Promise<boolean> {
        try {
            const result = await this.r2.send(
                new HeadObjectCommand({
                    Bucket: this.name,
                    Key: objectKey,
                })
            );
            // Si no lanza error, el objeto existe
            return result.$metadata.httpStatusCode === 200;
        } catch (err) {
            // Si el objeto no existe, HeadObjectCommand lanza una excepción
            //@ts-ignore
            if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
                return false;
            }
            // Otros errores se lanzan nuevamente
            throw err;
        }
    }

    /**
     * Retrieves metadata from an object without returning the object itself.
     * @param objectKey
     */
    public async headObject(objectKey: string): Promise<HeadObjectResponse> {
        const result = await this.r2.send(
            new HeadObjectCommand({
                Bucket: this.name,
                Key: objectKey,
            })
        );

        return {
            lastModified: result.LastModified,
            contentLength: result.ContentLength,
            acceptRanges: result.AcceptRanges,
            etag: result.ETag,
            contentType: result.ContentType,
            customMetadata: result.Metadata,
        };
    }

    /**
     * Returns some or all (up to 1,000) of the objects in the bucket with each request.
     * @param maxResults The maximum number of objects to return per request. (Default: 1000)
     * @param marker A token that specifies where to start the listing.
     */
    public async listObjects(maxResults = 1000, marker?: string): Promise<ObjectListResponse> {
        const result = await this.r2.send(
            new ListObjectsCommand({
                Bucket: this.name,
                MaxKeys: maxResults,
                Marker: marker,
            })
        );

        return {
            objects:
                result.Contents?.map((content:any) => {
                    const {
                        Key: key,
                        LastModified: lastModified,
                        ETag: etag,
                        ChecksumAlgorithm: checksumAlgorithm,
                        Size: size,
                        StorageClass: storageClass,
                    } = content;
                    return {
                        key,
                        lastModified,
                        etag,
                        checksumAlgorithm,
                        size,
                        storageClass,
                    };
                }) || [],
            continuationToken: result.Marker,
            nextContinuationToken: result.NextMarker,
        };
    }

    /**
     * Copies an object from the current storage bucket to a new destination object in the same bucket.
     * @param sourceObjectKey The key of the source object to be copied.
     * @param destinationObjectKey The key of the destination object where the source object will be copied to.
     */
    public async copyObject(sourceObjectKey: string, destinationObjectKey: string) {
        const result = await this.r2.send(
            new CopyObjectCommand({
                Bucket: this.name,
                CopySource: sourceObjectKey,
                Key: destinationObjectKey,
            })
        );

        return result;
    }

    /**
     * Get object devolution in format Buffer
     * @param key
     */
    public getFile = async (key: string): Promise<[string?, Buffer?]> => {

        try {
            const {Body} = await this.r2.send(new GetObjectCommand({
                Bucket: this.name, //  R2 bucket name
                Key: key // The key of the file you want to retrieve
            }));
            if (Body instanceof stream.Readable) {
                const chunks: Uint8Array[] = [];
                for await (const chunk of Body) {
                    chunks.push(chunk);
                }
                return [undefined, Buffer.concat(chunks)];
            } else {
                return ['Body is not a readable stream', undefined];
            }
        } catch (err) {

            return ['Error getting file from Cloudflare R2', undefined];
        }
    };
}



export type CloudflareR2Config = {
    accountId: string;
    accessKeyId: string;
    secretAccessKey: string;
    /**
     * If set, the endpoint will be `https://{accountId}.{jurisdiction}.r2.cloudflarestorage.com`.
     */
    jurisdiction?: 'eu' | 'fedramp';
};

export type BucketList = {
    buckets: {
        name?: string;
        creationDate?: Date;
    }[];
    owner: {
        id?: string;
        displayName?: string;
    };
};

export type UploadFileResponse = {
    objectKey: string;
    uri: string;
    /**
     * **DEPRECATED. This property will be removed in the next major version. Use `publicUrls` property instead.**
     * @deprecated
     */
    publicUrl: string | null;
    publicUrls: Array<string>;
    etag?: string;
    versionId?: string;
};

export type HeadObjectResponse = {
    lastModified?: Date;
    contentLength?: number;
    acceptRanges?: string;
    etag?: string;
    contentType?: string;
    customMetadata?: Record<string, string>;
};

export type CORSPolicy = {
    allowedHeaders?: string[];
    allowedMethods?: string[];
    allowedOrigins?: string[];
    exposeHeaders?: string[];
    id?: string;
    maxAgeSeconds?: number;
};

export type ObjectListResponse = {
    objects: {
        key?: string;
        lastModified?: Date;
        etag?: string;
        checksumAlgorithm?: string[];
        size?: number;
        storageClass?: string;
    }[];
    continuationToken?: string;
    nextContinuationToken?: string;
};

export const TYPE_FILE_OBJ = {
    JSON: 'application/json',
    SQL: 'application/sql',
    TEXT: 'application/txt',
    PDF: 'application/pdf',
    WORD: 'application/docx',
    EXCEL: 'application/xlsx',
    IMAGE_PNG: 'image/png',
    IMAGE_JPEG: 'image/jpeg',
    IMAGE_GIF: 'image/gif',
    AUDIO_MP3: 'audio/mpeg',
    VIDEO_MP4: 'video/mp4',
    VIDEO_WEBM: 'video/webm',
    CSV: 'text/csv',
} as const;

/**
 * Genera un uuid similar a la biblioteca de uuid v4
 */
export function f_uuid():string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r:number = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export type TYPE_FILE = typeof TYPE_FILE_OBJ[keyof typeof TYPE_FILE_OBJ];

