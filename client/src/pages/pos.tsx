import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { POSInterface } from "@/components/pos/pos-interface";

export default function POS() {
  return (
    <MainLayout title="Point of Sale" subtitle="Ready for transactions">
      <POSInterface />
    </MainLayout>
  );
}
