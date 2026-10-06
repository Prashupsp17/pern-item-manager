interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, totalItems, onPageChange }: PaginationProps) {
  if (totalPages <= 1) {
    return (
      <div className="pagination pagination--single">
        <span>{totalItems} item{totalItems === 1 ? '' : 's'}</span>
      </div>
    );
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="pagination">
      <span className="pagination-summary">
        Page {page} of {totalPages} ({totalItems} items)
      </span>
      <div className="pagination-controls">
        <button
          type="button"
          className="btn btn-secondary"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </button>
        {pages.map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            className={`btn ${pageNumber === page ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </button>
        ))}
        <button
          type="button"
          className="btn btn-secondary"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
