import { useId, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

export function SearchBar({
  initialValue = '',
  placeholder = 'Tìm tên truyện, tác giả...',
  onSearch,
  className = '',
}: {
  initialValue?: string
  placeholder?: string
  onSearch?: (value: string) => void
  className?: string
}) {
  const [value, setValue] = useState(initialValue)
  const inputId = useId()
  const navigate = useNavigate()

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const query = value.trim()
    if (onSearch) {
      onSearch(query)
    } else {
      navigate(`/search${query ? `?keyword=${encodeURIComponent(query)}` : ''}`)
    }
  }

  return (
    <form className={`search-bar ${className}`} onSubmit={submit} role="search">
      <label className="sr-only" htmlFor={inputId}>Tìm kiếm truyện</label>
      <input
        autoComplete="off"
        id={inputId}
        maxLength={100}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        type="search"
        value={value}
      />
      <button aria-label="Tìm kiếm" className="search-submit" type="submit">
        Tìm
      </button>
    </form>
  )
}
