type PersistenceNoticeProps = {
  messages: string[];
};

export function PersistenceNotice({ messages }: PersistenceNoticeProps) {
  if (messages.length === 0) {
    return null;
  }

  return (
    <>
      {messages.map((message) => (
        <div key={message} className="toolbar__notice" role="status">
          {message}
        </div>
      ))}
    </>
  );
}
