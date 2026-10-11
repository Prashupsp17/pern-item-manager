interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

const MAX_PAGE_BUTTONS = 7;

function getVisiblePages(page: number, totalPages: number): number[] {
  if (totalPages <= MAX_PAGE_BUTTONS) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const half = Math.floor(MAX_PAGE_BUTTONS / 2);
  let start = Math.max(1, page - half);
  let end = Math.min(totalPages, start + MAX_PAGE_BUTTONS - 1);
  start = Math.max(1, end - MAX_PAGE_BUTTONS + 1);

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export default function Pagination({ page, totalPages, totalItems, onPageChange }: PaginationProps) {
  const safeTotalPages = Math.max(1, totalPages);
  const safePage = Math.min(Math.max(1, page), safeTotalPages);

  if (safeTotalPages <= 1) {
    return (
      <div className="pagination pagination--single">
        <span>
          Page 1 of 1 ({totalItems} item{totalItems === 1 ? '' : 's'})
        </span>
      </div>
    );
  }

  const pages = getVisiblePages(safePage, safeTotalPages);

  return (
    <div className="pagination">
      <span className="pagination-summary">
        Page {safePage} of {safeTotalPages} ({totalItems} items)
      </span>
      <div className="pagination-controls">
        <button
          type="button"
          className="btn btn-secondary"
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
        >
          Previous
        </button>
        {pages.map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            className={`btn ${pageNumber === safePage ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </button>
        ))}
        <button
          type="button"
          className="btn btn-secondary"
          disabled={safePage >= safeTotalPages}
          onClick={() => onPageChange(safePage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
