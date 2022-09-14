export default function Exception(props: { status: number }): JSX.Element | null {
  const { status } = props;

  return <div>{status}</div>;
}
