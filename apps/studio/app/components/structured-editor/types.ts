export type StructuredEditorAction = (payload: FormData) => void;

export type StructuredEditorFormProps = {
  action: StructuredEditorAction;
  isPending: boolean;
};
