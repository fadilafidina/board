type PersistenceNoticeProps = {
  message: string | null;
};

export function PersistenceNotice({ message }: PersistenceNoticeProps) {
  if (!message) {
    return null;
  }

  return (
    <div className="toolbar__notice" role="status">
      {message}
    </div>
  );
}
