import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kinolar",
  description: "Kurs kinolarini boshqarish",
};

const layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <div>{children}</div>;
};

export default layout;
