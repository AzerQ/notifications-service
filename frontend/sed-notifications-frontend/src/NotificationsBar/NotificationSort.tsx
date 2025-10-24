import React from "react";
import {ArrowUpDown} from "lucide-react";
import {MaterialSelect} from "./MaterialSelect";
import {SortOption} from "./types";

export const NotificationSort: React.FC<{
    sortOption: SortOption;
    onSortChange: (sortOption: SortOption) => void;
}> = ({ sortOption, onSortChange }) => {
    // Options for sort field
    const fieldOptions = [
        {value: 'date', label: 'Дата'},
        {value: 'title', label: 'Заголовок'},
        {value: 'author', label: 'Автор'},
        {value: 'type', label: 'Тип'}
    ];

    // Options for sort order
    const orderOptions = [
        {value: 'desc', label: 'По убыванию'},
        {value: 'asc', label: 'По возрастанию'}
    ];

    const handleFieldChange = (field: string) => {
        onSortChange({ ...sortOption, field: field as 'date' | 'title' | 'author' | 'type' });
    };

    const handleOrderChange = (order: string) => {
        onSortChange({ ...sortOption, order: order as 'asc' | 'desc' });
    };

    return (
        <div className="bg-white rounded-lg border p-4 mb-6" data-testid="notification-sort">
            <div className="flex flex-wrap items-center gap-4" data-testid="notification-sort-container">
                <div className="flex items-center space-x-2">
                    <ArrowUpDown className="w-4 h-4 text-gray-500"/>
                    <span className="font-medium text-gray-700">Сортировка:</span>
                </div>

                <div className="flex flex-col" data-testid="notification-sort-field">
                    <label className="text-xs text-gray-500 mb-1">Поле</label>
                    <MaterialSelect
                        options={fieldOptions}
                        value={sortOption.field}
                        onChange={handleFieldChange}
                        className="min-w-[150px]"
                    />
                </div>

                <div className="flex flex-col" data-testid="notification-sort-order">
                    <label className="text-xs text-gray-500 mb-1">Порядок</label>
                    <MaterialSelect
                        options={orderOptions}
                        value={sortOption.order}
                        onChange={handleOrderChange}
                        className="min-w-[150px]"
                    />
                </div>
            </div>
        </div>
    );
};