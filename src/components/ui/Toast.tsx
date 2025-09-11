type Props = { message: string; variant: "success" | "error" }

const Toast = ({ message, variant }: Props) => (
  <div className={`fixed top-4 right-4 z-50 rounded-md px-4 py-2 shadow ${variant === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
    {message}
  </div>
)

export default Toast;


