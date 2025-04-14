export const Card = ({ className, children, ...props }) => <div className={`bg-purple-900/20 border border-purple-500/30 rounded-lg overflow-hidden ${className || ''}`} {...props}>{children}</div>;

export const CardHeader = ({ className, children, ...props }) => <div className={`p-6 ${className || ''}`} {...props}>{children}</div>;

export const CardTitle = ({ className, children, ...props }) => <h3 className={`text-xl font-semibold text-white ${className || ''}`} {...props}>{children}</h3>;

export const CardDescription = ({ className, children, ...props }) => <p className={`text-gray-300 mt-1 ${className || ''}`} {...props}>{children}</p>;

export const CardContent = ({ className, children, ...props }) => <div className={`p-6 pt-0 ${className || ''}`} {...props}>{children}</div>;

export const CardFooter = ({ className, children, ...props }) => <div className={`p-6 pt-0 flex items-center ${className || ''}`} {...props}>{children}</div>;
