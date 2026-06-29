"use client"

import { useParams } from "next/navigation"
import { ItemForm } from "@/components/shared/ItemForm"

export default function EditItemPage() {
  const params = useParams()
  return <ItemForm editId={params.id as string} />
}
