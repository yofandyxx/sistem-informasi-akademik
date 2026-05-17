const Icon = ({ name, size = 20, className = '', color = '' }) => {
    const icons = {
        // Navigation
        home: '🏠',
        book: '📚',
        users: '👥',
        calendar: '📅',
        exchange: '🔄',
        chart: '📊',
        menu: '☰',
        close: '✕',

        // Actions
        plus: '+',
        search: '🔍',
        edit: '✏️',
        trash: '🗑️',
        filter: '⚙️',
        check: '✓',
        checkcircle: '✓',
        alert: '⚠️',
        clock: '⏰',
        trending: '📈',
        download: '⬇️',
        phone: '📱',
        graduation: '🎓',
        user: '👤',
        bookopen: '📖',
        barchart: '📊',
        award: '🏆',
        shield: '🛡️',
        trendingdown: '📉',
        activity: '⚡',

        // Status
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️',

        // Arrows
        chevronright: '›',
        chevronleft: '‹',
        chevronup: '⌃',
        chevrondown: '⌄'
    };

    const style = {
        fontSize: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        color: color
    };

    return (
        <span
            className={className}
            style={style}
        >
            {icons[name] || '📄'}
        </span>
    );
};

export default Icon;