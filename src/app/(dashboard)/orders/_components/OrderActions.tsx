"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SheetTrigger } from "@/components/ui/sheet";
import { useAuthorization } from "@/hooks/use-authorization";
import OrderFormSheet from "./form/OrderFormSheet";
import { addOrder } from "@/actions/orders/addOrders";

export default function OrderActions() {
  const { hasPermission } = useAuthorization();

  return (
    <div>
      {hasPermission("products", "canCreate") && (
        <OrderFormSheet
          title="Place Order"
          description="Place Order here"
          submitButtonText="Place Order"
          actionVerb="added"
          action={addOrder}
        >
          <SheetTrigger asChild>
            <Button variant="default" size="lg" className="h-12 flex-grow">
              <Plus className="mr-2 size-4" /> Place Order
            </Button>
          </SheetTrigger>
        </OrderFormSheet>
      )}
    </div>
  );
}
