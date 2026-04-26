<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DiaryEntryRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Authorization is handled at the controller/policy level
        return $this->user()->isTeacher() || $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'type'        => ['required', 'in:homework,announcement,remark'],
            'title'       => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:5000'],
            'class_id'    => ['nullable', 'exists:classes,id'],
            'subject_id'  => ['nullable', 'exists:subjects,id'],
            'student_id'  => ['nullable', 'required_if:type,remark', 'exists:users,id'],
            'due_date'    => ['nullable', 'date', 'after_or_equal:today'],
            'version'     => ['nullable', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'student_id.required_if' => 'A student must be selected for remark entries.',
            'due_date.after_or_equal' => 'The due date must be today or a future date.',
        ];
    }

    protected function prepareForValidation(): void
    {
        // Clear student_id for non-remark types
        if ($this->type !== 'remark') {
            $this->merge(['student_id' => null]);
        }
        // Clear due_date for non-homework types
        if ($this->type !== 'homework') {
            $this->merge(['due_date' => null]);
        }
    }
}
