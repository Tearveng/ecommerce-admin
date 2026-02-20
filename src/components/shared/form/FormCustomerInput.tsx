"use client";

import { forwardRef, Ref, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Control, FieldValues, Path } from "react-hook-form";

import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { createBrowserClient } from "@/lib/supabase/client";
import { fetchCategoriesDropdown } from "@/services/categories";
import FetchDropdownContainer from "@/components/shared/FetchDropdownContainer";
import { Autocomplete, ICustomersOption } from "@/components/ui/auto-complete";
import { fetchCustomers } from "@/services/customers";
import { FetchCustomersResponse } from "@/services/customers/types";

type FormCategoryInputProps<TFormData extends FieldValues> = {
  control: Control<TFormData>;
  name: Path<TFormData>;
  label: string;
  container?: HTMLDivElement;
};

const FormCustomerInput = forwardRef(function FormCategoryInputRender<
  TFormData extends FieldValues,
>(
  { control, name, label, container }: FormCategoryInputProps<TFormData>,
  ref: Ref<HTMLButtonElement>,
) {
  const [searchInput, setSearchInput] = useState<string>("");

  const {
    data: customers,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["customers", "dropdown"],
    queryFn: () =>
      fetchCustomers(createBrowserClient() as any, { search: searchInput }),
    staleTime: 5 * 60 * 1000,
  });

  const mapperCustomers = (
    customers: FetchCustomersResponse,
  ): ICustomersOption[] => {
    return customers.data.map((data) => ({ label: data.name, value: data.id }));
  };

  const getOptions = () => {
    if (!isLoading && !isError && customers) {
      return mapperCustomers(customers);
    }

    return [];
  };

  const onSearchChange = (value: string) => {
    setSearchInput(value);
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col md:flex-row md:gap-x-4 md:space-y-0">
          <FormLabel className="md:flex-shrink-0 md:w-1/4 md:mt-2 leading-snug">
            {label}
          </FormLabel>

          <div className="space-y-2 w-full">
            <FetchDropdownContainer
              isLoading={isLoading}
              isError={isError}
              errorMessage="Failed to load categories"
            >
              <Autocomplete
                onSearchChange={onSearchChange}
                options={getOptions()}
                onChange={field.onChange}
                placeholder="Searching customer ..."
                value={field.value}
                search={searchInput}
              />
            </FetchDropdownContainer>

            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
}) as <TFormData extends FieldValues>(
  props: FormCategoryInputProps<TFormData> & { ref?: Ref<HTMLButtonElement> },
) => React.ReactElement;

export default FormCustomerInput;
