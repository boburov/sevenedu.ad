import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Do'kon",
  description: "Do'kon mahsulotlarini boshqarish",
};

const layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <div>{children}</div>;
};

export default layout;
