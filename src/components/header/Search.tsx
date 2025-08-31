import React from "react";
import { FiSearch } from "react-icons/fi";

interface SearchProps {
    value: string;
    onChange: (val: string) => void;
    placeholder: string;
    onFocus?: () => void;
    onBlur?: () => void;
    onClickIcon?: () => void;
    inputRef?: React.RefObject<HTMLInputElement | null>;
    className?: string;
}

const Search: React.FC<SearchProps> = React.memo(({
    value,
    onChange,
    placeholder,
    onFocus,
    onBlur,
    onClickIcon,
    inputRef,
    className = "",
}) => (
    <div className="relative flex items-center group">
        <FiSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white opacity-90 cursor-pointer z-10"
            size={19}
            onClick={onClickIcon}
        />
        <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder={placeholder}
            className={`
                pl-10 pr-4 py-2 
                rounded-full 
                bg-transparent 
                text-white 
                placeholder-white/70 
                outline-none 
                border border-white
                focus:border-yellow-400 
                transition-all duration-150 
                w-80 font-semibold
                ${className}
            `}
            style={{
                letterSpacing: "0.04em"
            }}
            autoComplete="off"
            spellCheck={false}
        />
    </div>
));

Search.displayName = "Search";

export default Search;
