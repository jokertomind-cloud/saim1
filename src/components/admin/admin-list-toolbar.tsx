interface FilterOption {
  label: string;
  value: string;
}

interface Props {
  keyword: string;
  keywordPlaceholder: string;
  keywordLabel?: string;
  onKeywordChange: (value: string) => void;
  countLabel: string;
  selectLabel?: string;
  selectValue?: string;
  selectOptions?: FilterOption[];
  onSelectChange?: (value: string) => void;
}

export const AdminListToolbar = ({
  keyword,
  keywordPlaceholder,
  keywordLabel = "検索",
  onKeywordChange,
  countLabel,
  selectLabel,
  selectValue,
  selectOptions,
  onSelectChange
}: Props) => (
  <div className="stack">
    <div className={selectOptions?.length ? "grid-2" : "stack"}>
      <label className="field">
        <span>{keywordLabel}</span>
        <input
          className="input"
          onChange={(event) => onKeywordChange(event.target.value)}
          placeholder={keywordPlaceholder}
          type="search"
          value={keyword}
        />
      </label>
      {selectOptions?.length && selectLabel && onSelectChange ? (
        <label className="field">
          <span>{selectLabel}</span>
          <select className="select" onChange={(event) => onSelectChange(event.target.value)} value={selectValue}>
            {selectOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}
    </div>
    <p className="hint">{countLabel}</p>
  </div>
);
