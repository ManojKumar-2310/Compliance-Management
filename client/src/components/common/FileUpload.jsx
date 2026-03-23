import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const FileUpload = ({ onUpload, maxFiles = 5, maxSize = 10485760 }) => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);

    const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
        // Handle rejected files
        if (rejectedFiles.length > 0) {
            rejectedFiles.forEach(({ file, errors }) => {
                errors.forEach(error => {
                    if (error.code === 'file-too-large') {
                        toast.error(`${file.name} is too large (max 10MB)`);
                    } else if (error.code === 'too-many-files') {
                        toast.error(`Too many files (max ${maxFiles})`);
                    } else {
                        toast.error(`Error with ${file.name}: ${error.message}`);
                    }
                });
            });
        }

        // Add accepted files
        const newFiles = acceptedFiles.map(file => ({
            file,
            id: Math.random().toString(36).substr(2, 9),
            progress: 0,
            status: 'pending' // pending, uploading, success, error
        }));

        setFiles(prev => [...prev, ...newFiles]);
    }, [maxFiles]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles,
        maxSize,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'application/vnd.ms-excel': ['.xls'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
        }
    });

    const removeFile = (id) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    const handleUpload = async () => {
        if (files.length === 0) {
            toast.error('No files to upload');
            return;
        }

        setUploading(true);

        try {
            // Simulate upload progress
            for (const item of files) {
                if (item.status !== 'pending') continue;

                // Update status to uploading
                setFiles(prev => prev.map(f =>
                    f.id === item.id ? { ...f, status: 'uploading', progress: 0 } : f
                ));

                // Simulate progress
                for (let progress = 0; progress <= 100; progress += 10) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    setFiles(prev => prev.map(f =>
                        f.id === item.id ? { ...f, progress } : f
                    ));
                }

                // Mark as success
                setFiles(prev => prev.map(f =>
                    f.id === item.id ? { ...f, status: 'success', progress: 100 } : f
                ));
            }

            toast.success('Files uploaded successfully!');

            // Call parent callback if provided
            if (onUpload) {
                onUpload(files.map(f => f.file));
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Upload failed');
            setFiles(prev => prev.map(f =>
                f.status === 'uploading' ? { ...f, status: 'error' } : f
            ));
        } finally {
            setUploading(false);
        }
    };

    const getFileIcon = (file) => {
        if (file.type.startsWith('image/')) return '🖼️';
        if (file.type === 'application/pdf') return '📄';
        if (file.type.includes('word')) return '📝';
        if (file.type.includes('excel') || file.type.includes('spreadsheet')) return '📊';
        return '📎';
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <div className="space-y-4">
            {/* Dropzone */}
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragActive
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
            >
                <input {...getInputProps()} />
                <Upload className="mx-auto mb-4 text-muted-foreground" size={48} />
                {isDragActive ? (
                    <p className="text-lg font-medium">Drop files here...</p>
                ) : (
                    <>
                        <p className="text-lg font-medium mb-2">Drag & drop files here</p>
                        <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
                        <p className="text-xs text-muted-foreground">
                            Supports: PDF, Word, Excel, Images (Max {maxFiles} files, 10MB each)
                        </p>
                    </>
                )}
            </div>

            {/* File List */}
            <AnimatePresence>
                {files.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                    >
                        {files.map(item => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="bg-card border border-border rounded-lg p-4"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{getFileIcon(item.file)}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{item.file.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatFileSize(item.file.size)}
                                        </p>
                                        {item.status === 'uploading' && (
                                            <div className="mt-2">
                                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary transition-all duration-300"
                                                        style={{ width: `${item.progress}%` }}
                                                    />
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {item.progress}%
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {item.status === 'success' && (
                                            <CheckCircle className="text-green-600" size={20} />
                                        )}
                                        {item.status === 'error' && (
                                            <AlertCircle className="text-red-600" size={20} />
                                        )}
                                        {item.status === 'pending' && (
                                            <button
                                                onClick={() => removeFile(item.id)}
                                                className="p-1 hover:bg- rounded transition-colors text-muted-foreground hover:text-foreground"
                                            >
                                                <X size={20} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Upload Button */}
            {files.length > 0 && files.some(f => f.status === 'pending') && (
                <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {uploading ? 'Uploading...' : `Upload ${files.filter(f => f.status === 'pending').length} file(s)`}
                </button>
            )}
        </div>
    );
};

export default FileUpload;
