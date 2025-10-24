import React, {useState} from "react";
import {ChevronDown, Filter} from "lucide-react";
import {MaterialSelect} from "./MaterialSelect";
import {ModalInput} from "./ModalInput";
import {Filters, InAppNotificationData, Preset} from "./types";

export const NotificationFilters: React.FC<{
    notifications: InAppNotificationData[],
    filters: Filters;
    onFilterChange: (key: keyof Filters, value: string) => void;
    onSavePreset: () => void;
    presets: Preset[];
    onApplyPreset: (preset: Preset) => void;
    isModalOpen: boolean;
    onModalOpen: () => void;
    onModalClose: () => void;
    onModalSave: (name: string) => void;
}> = ({
          filters,
          onFilterChange,
          notifications,
          onSavePreset,
          presets,
          onApplyPreset,
          isModalOpen,
          onModalOpen,
          onModalClose,
          onModalSave
      }) => {
    const [showPresets, setShowPresets] = useState(false);

    // Options for selects
    const typeOptions = [
        {value: '', label: 'Все типы'},
        {value: 'document', label: 'Документы'},
        {value: 'task', label: 'Задания'},
        {value: 'system', label: 'Системные'}
    ];

    const statusOptions = [
        {value: '', label: 'Все статусы'},
        {value: 'unread', label: 'Непрочитанные'},
        {value: 'read', label: 'Прочитанные'}
    ];


    const subtypeOptions = [
        {value: '', label: 'Все подвиды'},
        ...notifications.map(n => ({value: n.subtype, label: n.subtype}))
    ];

    const authorOptions = [
        {value: '', label: 'Все авторы'},
        ...notifications.map(n => ({value: n.author, label: n.author}))
    ];

    return (
        <>
            <div className="bg-white rounded-lg border p-4 mb-6" data-testid="notification-filters">
                <div className="flex flex-wrap items-center gap-4" data-testid="notification-filters-container">
                    <div className="flex items-center space-x-2">
                        <Filter className="w-4 h-4 text-gray-500"/>
                        <span className="font-medium text-gray-700">Фильтры:</span>
                    </div>

                    <div className="flex flex-col" data-testid="notification-filters-type">
                        <label className="text-xs text-gray-500 mb-1">Тип</label>
                        <MaterialSelect
                            options={typeOptions}
                            value={filters.type}
                            onChange={(value) => onFilterChange('type', value)}
                            className="min-w-[150px]"
                        />
                    </div>

                    <div className="flex flex-col" data-testid="notification-filters-subtype">
                        <label className="text-xs text-gray-500 mb-1">Подтип</label>
                        <MaterialSelect
                            options={subtypeOptions}
                            value={filters.subtype}
                            onChange={(value) => onFilterChange('subtype', value)}
                            className="min-w-[180px]"
                        />
                    </div>

                    <div className="flex flex-col" data-testid="notification-filters-status">
                        <label className="text-xs text-gray-500 mb-1">Статус</label>
                        <MaterialSelect
                            options={statusOptions}
                            value={filters.status}
                            onChange={(value) => onFilterChange('status', value)}
                            className="min-w-[150px]"
                        />
                    </div>

                    <div className="flex flex-col" data-testid="notification-filters-author">
                        <label className="text-xs text-gray-500 mb-1">Автор</label>
                        <MaterialSelect
                            options={authorOptions}
                            value={filters.author}
                            onChange={(value) => onFilterChange('author', value)}
                            className="min-w-[150px]"
                        />
                    </div>

                    <div className="relative" data-testid="notification-filters-presets">
                        <button
                            onClick={() => setShowPresets(!showPresets)}
                            className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
                            data-testid="notification-filters-presets-toggle"
                        >
                            <span>Пресеты</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${showPresets ? 'rotate-180' : ''}`}/>
                        </button>

                        {showPresets && (
                            <div
                                className="absolute top-full left-0 mt-2 bg-white border rounded-lg shadow-lg z-10 min-w-48"
                                data-testid="notification-filters-presets-dropdown"
                            >
                                <div className="p-2">
                                    <button
                                        onClick={() => {
                                            onModalOpen();
                                            setShowPresets(false);
                                        }}
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                                        data-testid="notification-filters-save-preset-button"
                                    >
                                        Сохранить текущий фильтр
                                    </button>
                                    {presets.map((preset, index) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                onApplyPreset(preset);
                                                setShowPresets(false);
                                            }}
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                                            data-testid={`notification-filters-preset-${index}`}
                                            data-preset-name={preset.name}
                                        >
                                            {preset.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ModalInput
                isOpen={isModalOpen}
                onClose={onModalClose}
                onSave={onModalSave}
                title="Сохранить пресет фильтра"
            />
        </>
    );
};