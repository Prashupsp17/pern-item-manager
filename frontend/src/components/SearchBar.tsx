interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search by title or description...',
}: SearchBarProps) {
  return (
    <div className="search-bar">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        id="search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
