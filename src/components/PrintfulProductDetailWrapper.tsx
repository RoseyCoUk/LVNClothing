import { useParams } from 'react-router-dom'
import PrintfulProductDetail from './PrintfulProductDetail'

export default function PrintfulProductDetailWrapper() {
  const { id } = useParams<{ id: string }>()
  
  if (!id) {
    return <div className="p-6 text-center">Product ID not found</div>
  }
  
  return <PrintfulProductDetail productId={id} />
}
