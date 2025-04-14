export const Button = ({ children, className, variant = "default", size = "default", ...props }) => {
  const variantClasses = {
    default: "bg-purple-600 hover:bg-purple-700 text-white",
    secondary: "bg-purple-500/20 hover:bg-purple-500/30 text-white",
    ghost: "hover:bg-purple-500/10 text-gray-300 hover:text-white"
  };
  
  const sizeClasses = {
    default: "px-4 py-2",
    sm: "px-3 py-1 text-sm",
    lg: "px-6 py-3 text-lg",
    icon: "p-2"
  };
  
  return (
    <button 
      className={`rounded-md transition-colors ${variantClasses[variant]} ${sizeClasses[size]} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
};
