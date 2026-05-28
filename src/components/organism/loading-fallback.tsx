interface LoadingFallbackProps {
    message?: string;
    submessage?: string;
    size?: "sm" | "md" | "lg";
    fullScreen?: boolean;
    className?: string;
}


export function LoadingFallback({
    message = "Loading ...",
    submessage,
    size = "md",
    fullScreen = true,
    className = "",
                                }: LoadingFallbackProps) {
    const sizeClasses = {
        sm: "w-6 h-6",
        md: "w-8 h-8",
        lg: "w-12 h-12"
    };

    const containerClasses = fullScreen
        ? "flex items-center justify-center min-h-screen"
        : "flex items-center justify-center p-8";

    return (
        <div className={`${containerClasses} ${className}`}>
            <div className="flex flex-col items-center space-y-4">
                {/* Enhanced loading spinner */}
                <div className="relative">
                    <div
                        className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-200 border-t-primary`}
                    ></div>
                    <div
                        className={`${sizeClasses[size]} absolute top-0 animate-ping rounded-full border-4 border-primary opacity-20`}
                    ></div>
                </div>

                {/* Loading text */}
                <div className="text-center space-y-2">
                    <p className="text-lg font-medium text-foreground animate-pulse">
                        {message}
                    </p>
                    {submessage && (
                        <p className="text-sm text-muted-foreground">{submessage}</p>
                    )}
                </div>

                {/* Loading dots animation */}
                <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                </div>
            </div>
        </div>
    )
}

// Specialized loading components
export function FormLoadingFallback() {
    return (
        <LoadingFallback
            message="Loading form..."
            submessage="Please wait while we prepare your form"
            fullScreen={false}
        />
    );
}

export function DataLoadingFallback() {
    return (
        <LoadingFallback
            message="Loading data..."
            submessage="Fetching the latest information"
            fullScreen={false}
        />
    );
}

export function PageLoadingFallback() {
    return (
        <LoadingFallback
            message="Loading page..."
            submessage="Setting up your workspace"
            size="lg"
            fullScreen={true}
        />
    );
}