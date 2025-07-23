CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  gender CHAR(1),
  birthdate DATE,
  parent TEXT,
  contact TEXT
);

CREATE TABLE teachers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  hourly_rate NUMERIC(6,2) NOT NULL
);

CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  hourly_rate NUMERIC(6,2) NOT NULL,
  teacher_id INT REFERENCES teachers(id) ON DELETE CASCADE
);

CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  student_id INT REFERENCES students(id) ON DELETE CASCADE,
  course_id INT REFERENCES courses(id) ON DELETE CASCADE,
  teacher_id INT REFERENCES teachers(id) ON DELETE CASCADE,
  hourly_rate NUMERIC(6,2),
  purchased_hours INT,
  discounted_tuition NUMERIC(6,2) DEFAULT 0,
  amount_paid NUMERIC(8,2),
  payment_method VARCHAR(20) DEFAULT 'Cash'
);

-- Add similar for sessions, expenses ...
