/**
 * Утилита для обработки и форматирования ошибок API
 */

export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

export const formatApiError = (error: any): string => {
  // Если это строка, возвращаем как есть
  if (typeof error === 'string') {
    return error;
  }

  // Если есть response с данными
  if (error.response?.data) {
    const data = error.response.data;
    
    // Если есть массив ошибок валидации
    if (Array.isArray(data.message)) {
      return data.message.join(', ');
    }
    
    // Если есть объект с ошибками валидации
    if (data.errors && typeof data.errors === 'object') {
      const errorMessages = Object.values(data.errors).flat();
      return errorMessages.join(', ');
    }
    
    // Если есть простое сообщение
    if (data.message) {
      return data.message;
    }
  }

  // Если есть message в error
  if (error.message) {
    return error.message;
  }

  // Стандартные сообщения по статусам
  if (error.response?.status) {
    const status = error.response.status;
    switch (status) {
      case 400:
        return 'Неверный запрос';
      case 401:
        return 'Необходима авторизация';
      case 403:
        return 'Доступ запрещен';
      case 404:
        return 'Ресурс не найден';
      case 409:
        return 'Конфликт данных';
      case 422:
        return 'Ошибка валидации данных';
      case 500:
        return 'Внутренняя ошибка сервера';
      default:
        return `Ошибка ${status}`;
    }
  }

  // Если нет сети
  if (error.code === 'ERR_NETWORK' || !error.response) {
    return 'Ошибка подключения к серверу. Проверьте подключение к интернету.';
  }

  return 'Произошла неизвестная ошибка';
};

export const getApiError = (error: any): ApiError => {
  const message = formatApiError(error);
  const status = error.response?.status;
  const errors = error.response?.data?.errors;

  return {
    message,
    status,
    errors,
  };
};
