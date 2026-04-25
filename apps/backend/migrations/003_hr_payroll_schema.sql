-- Phase 3: HR & Payroll Module
-- Enjaz Management System

-- Employee Profiles (ملفات الموظفين)
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  employee_code VARCHAR(50) UNIQUE NOT NULL,
  full_name_ar VARCHAR(255) NOT NULL,
  full_name_en VARCHAR(255),
  national_id VARCHAR(50),
  date_of_birth DATE,
  gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
  marital_status VARCHAR(20) CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed')),
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(50),
  hire_date DATE NOT NULL,
  position VARCHAR(100) NOT NULL,
  department VARCHAR(100),
  employment_type VARCHAR(50) CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'temporary')),
  contract_start_date DATE,
  contract_end_date DATE,
  base_salary DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'IQD',
  bank_name VARCHAR(100),
  bank_account_number VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  termination_date DATE,
  termination_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employee Documents (مستندات الموظفين)
CREATE TABLE employee_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  document_type VARCHAR(100) NOT NULL,
  document_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  expiry_date DATE,
  uploaded_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leave Types (أنواع الإجازات)
CREATE TABLE leave_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar VARCHAR(100) NOT NULL,
  name_en VARCHAR(100),
  days_per_year INTEGER NOT NULL,
  is_paid BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leave Balances (أرصدة الإجازات)
CREATE TABLE leave_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  leave_type_id UUID REFERENCES leave_types(id) NOT NULL,
  year INTEGER NOT NULL,
  total_days DECIMAL(5, 2) NOT NULL,
  used_days DECIMAL(5, 2) DEFAULT 0,
  remaining_days DECIMAL(5, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, leave_type_id, year)
);

-- Leave Requests (طلبات الإجازات)
CREATE TABLE leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number VARCHAR(50) UNIQUE NOT NULL,
  employee_id UUID REFERENCES employees(id) NOT NULL,
  leave_type_id UUID REFERENCES leave_types(id) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days DECIMAL(5, 2) NOT NULL,
  reason TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Salary Components (مكونات الراتب)
CREATE TABLE salary_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar VARCHAR(100) NOT NULL,
  name_en VARCHAR(100),
  component_type VARCHAR(50) NOT NULL CHECK (component_type IN ('allowance', 'deduction')),
  is_taxable BOOLEAN DEFAULT false,
  is_fixed BOOLEAN DEFAULT true,
  default_amount DECIMAL(15, 2),
  calculation_method VARCHAR(50) CHECK (calculation_method IN ('fixed', 'percentage', 'formula')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employee Salary Structure (هيكل رواتب الموظفين)
CREATE TABLE employee_salary_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  salary_component_id UUID REFERENCES salary_components(id) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  effective_from DATE NOT NULL,
  effective_to DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payroll Runs (دورات الرواتب)
CREATE TABLE payroll_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_number VARCHAR(50) UNIQUE NOT NULL,
  period_month INTEGER NOT NULL CHECK (period_month BETWEEN 1 AND 12),
  period_year INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_employees INTEGER NOT NULL,
  total_gross_salary DECIMAL(15, 2) NOT NULL,
  total_deductions DECIMAL(15, 2) NOT NULL,
  total_net_salary DECIMAL(15, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'calculated', 'approved', 'paid', 'cancelled')),
  calculated_at TIMESTAMPTZ,
  calculated_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payslips (قسائم الرواتب)
CREATE TABLE payslips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payslip_number VARCHAR(50) UNIQUE NOT NULL,
  payroll_run_id UUID REFERENCES payroll_runs(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES employees(id) NOT NULL,
  period_month INTEGER NOT NULL,
  period_year INTEGER NOT NULL,
  working_days INTEGER NOT NULL,
  present_days INTEGER NOT NULL,
  absent_days INTEGER DEFAULT 0,
  base_salary DECIMAL(15, 2) NOT NULL,
  total_allowances DECIMAL(15, 2) DEFAULT 0,
  total_deductions DECIMAL(15, 2) DEFAULT 0,
  gross_salary DECIMAL(15, 2) NOT NULL,
  net_salary DECIMAL(15, 2) NOT NULL,
  payment_date DATE,
  payment_method VARCHAR(50),
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'paid')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payslip Details (تفاصيل قسيمة الراتب)
CREATE TABLE payslip_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payslip_id UUID REFERENCES payslips(id) ON DELETE CASCADE NOT NULL,
  salary_component_id UUID REFERENCES salary_components(id) NOT NULL,
  component_type VARCHAR(50) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employee Advances (سلف الموظفين)
CREATE TABLE employee_advances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advance_number VARCHAR(50) UNIQUE NOT NULL,
  employee_id UUID REFERENCES employees(id) NOT NULL,
  request_date DATE NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  reason TEXT,
  installments INTEGER NOT NULL,
  monthly_deduction DECIMAL(15, 2) NOT NULL,
  remaining_amount DECIMAL(15, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'completed', 'cancelled')),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  start_deduction_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Advance Deductions (استقطاعات السلف)
CREATE TABLE advance_deductions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advance_id UUID REFERENCES employee_advances(id) ON DELETE CASCADE NOT NULL,
  payslip_id UUID REFERENCES payslips(id),
  deduction_date DATE NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for HR & Payroll Module
CREATE INDEX idx_employees_user ON employees(user_id);
CREATE INDEX idx_employees_active ON employees(is_active);
CREATE INDEX idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_payroll_runs_period ON payroll_runs(period_year, period_month);
CREATE INDEX idx_payslips_employee ON payslips(employee_id);
CREATE INDEX idx_payslips_payroll ON payslips(payroll_run_id);
CREATE INDEX idx_advances_employee ON employee_advances(employee_id);
CREATE INDEX idx_advances_status ON employee_advances(status);

-- Insert default leave types
INSERT INTO leave_types (name_ar, name_en, days_per_year, is_paid, requires_approval) VALUES
('إجازة سنوية', 'Annual Leave', 30, true, true),
('إجازة مرضية', 'Sick Leave', 14, true, true),
('إجازة بدون راتب', 'Unpaid Leave', 0, false, true),
('إجازة طارئة', 'Emergency Leave', 5, true, true);

-- Insert default salary components
INSERT INTO salary_components (name_ar, name_en, component_type, is_taxable, is_fixed) VALUES
('بدل نقل', 'Transport Allowance', 'allowance', false, true),
('بدل هاتف', 'Phone Allowance', 'allowance', false, true),
('بدل سكن', 'Housing Allowance', 'allowance', false, true),
('مكافأة أداء', 'Performance Bonus', 'allowance', true, false),
('غياب', 'Absence Deduction', 'deduction', false, false),
('تأخير', 'Late Deduction', 'deduction', false, false),
('سلفة', 'Advance Deduction', 'deduction', false, false);
