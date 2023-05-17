import { useEffect, useRef, useState } from "react";
import { z } from "zod";

function EditableInput({
  initialText,
  onTextChange,
  validator,
}: {
  initialText: string;
  onTextChange: (text: string) => void;
  validator?: z.ZodString;
}) {
  const [isError, setIsError] = useState(false);
  const [edit, setEdit] = useState(false);
  const [text, setText] = useState(initialText);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setText(initialText);
  }, [initialText]);

  const handleBlur = () => {
    setEdit(false);
    onTextChange(text);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      setEdit(false);
      onTextChange(text);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!validator) {
      setText(e.target.value);
      return;
    }
    const result = validator?.safeParse(e.target.value);
    if (result?.success) {
      setText(e.target.value);
      setIsError(false);
    } else {
      setText(e.target.value);
      setIsError(true);
    }
  };

  const focusInput = () => {
    setEdit(true);
    inputRef.current?.focus();
  };

  return (
    <div
      className={`grid grid-cols-1 items-baseline ${
        isError ? "text-red-600" : ""
      }`}
    >
      {!edit && (
        <div className={"col-start-1 row-start-1"} onClick={focusInput}>
          {text} {isError && "!"}{" "}
          <button
            className="text-base font-light hover:underline"
            onClick={focusInput}
          >
            Edit
          </button>
        </div>
      )}
      <input
        className={`col-start-1 row-start-1 w-full ${
          edit ? "bg-transparent" : "pointer-events-none opacity-0"
        }`}
        ref={inputRef}
        type="text"
        value={text}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}

export default EditableInput;
