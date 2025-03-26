<div className="space-y-4">
  <div>
    <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
      Questão
    </label>
    <input
      id="question"
      type="text"
      {...register("question")}
      className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:outline-none ${errors.question
        ? "border-red-300 focus:border-red-500 focus:ring-red-100"
        : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
        }`}
    />
    {errors.question && (
      <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {errors.question.message}
      </p>
    )}
  </div>

  <div>
    <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
      Resposta
    </label>
    <input
      id="answer"
      type="text"
      {...register("answer")}
      className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:outline-none ${errors.answer
        ? "border-red-300 focus:border-red-500 focus:ring-red-100"
        : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
        }`}
    />
    {errors.answer && (
      <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {errors.answer.message}
      </p>
    )}
  </div>

  <div>
    <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
      Categoria
    </label>
    <input
      id="topic"
      type="text"
      {...register("topic")}
      className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:outline-none ${errors.topic
        ? "border-red-300 focus:border-red-500 focus:ring-red-100"
        : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
        }`}
    />
    {errors.topic && (
      <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {errors.topic.message}
      </p>
    )}
  </div>

  <div>
    <Controller
      name="img"
      control={control}
      render={({ field, fieldState }) => (
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            Imagem
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </label>

          <CustomFileInput
            field={field}
            accept="image/*"
            buttonText="Selecionar imagem"
            buttonTextColor="text-white"
            buttonBgColor="bg-blue-600 hover:bg-blue-700"
          />

          {fieldState.error && (
            <p className="mt-1 text-sm text-red-500">
              {fieldState.error.message}
            </p>
          )}
        </div>
      )}
    />
  </div>
</div>

