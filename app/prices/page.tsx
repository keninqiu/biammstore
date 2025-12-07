import BinancePriceDisplay from '@/app/components/BinancePriceDisplay'

export default function PricesPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
            <BinancePriceDisplay />
        </div>
    )
}
