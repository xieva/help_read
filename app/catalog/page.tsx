import { Suspense } from "react";
import CatalogPage from "@/components/catalog/CatalogPage";
export default function Page() { return <Suspense fallback={<p className="wrap py-16">책을 불러오는 중</p>}><CatalogPage /></Suspense>; }
