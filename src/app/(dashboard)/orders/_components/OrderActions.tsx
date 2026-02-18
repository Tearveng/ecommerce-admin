"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SheetTrigger } from "@/components/ui/sheet";
import { ExportDataButtons } from "@/components/shared/ExportDataButtons";
import { addProduct } from "@/actions/products/addProduct";
import { exportProducts } from "@/actions/products/exportProducts";
import { useAuthorization } from "@/hooks/use-authorization";
import ProductFormSheet from "../../products/_components/form/ProductFormSheet";

export default function OrderActions() {
  const { hasPermission } = useAuthorization();

  return (
    <div className="flex flex-col xl:flex-row xl:justify-between gap-4">
      {hasPermission("products", "canCreate") && (
        <ProductFormSheet
          title="Add Product"
          description="Add necessary product information here"
          submitButtonText="Add Product"
          actionVerb="added"
          action={addProduct}
        >
          <SheetTrigger asChild>
            <Button
              variant="default"
              size="lg"
              className="sm:flex-grow xl:flex-grow-0 md:basis-[25%]"
            >
              <Plus className="mr-2 size-4" /> Add Product
            </Button>
          </SheetTrigger>
        </ProductFormSheet>
      )}
    </div>
  );
}
