export const Card = ({ children, className = '', title, actions }) => {
    return (
        <div className={`bg-white rounded-xl shadow-md overflow-hidden ${className}`}>
            {title && (
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                    {actions && <div>{actions}</div>}
                </div>
            )}
            <div className="p-6">{children}</div>
        </div>
    );
};
