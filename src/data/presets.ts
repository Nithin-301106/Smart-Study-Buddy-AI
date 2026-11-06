export interface TopicPreset {
  id: string;
  title: string;
  subject: string;
  year: '1st Year' | '2nd Year';
  category: 'cs' | 'math' | 'physics' | 'electronics' | 'chemistry' | 'management';
  suggestedNotesPrompt: string;
  suggestedConcept: string;
  suggestedCodeSnippet?: {
    language: string;
    code: string;
    description: string;
  };
}

export const TOPIC_PRESETS: TopicPreset[] = [
  {
    id: 'cs-bsearch',
    title: 'Binary Search Algorithm',
    subject: 'Data Structures & Algorithms',
    year: '1st Year',
    category: 'cs',
    suggestedNotesPrompt: 'Binary Search Algorithm: Divide and conquer, loop invariants, time complexity O(log n), iterative vs recursive implementation.',
    suggestedConcept: 'Logarithmic Time Complexity O(log n)',
    suggestedCodeSnippet: {
      language: 'python',
      description: 'Iterative Binary Search with midpoint calculation avoiding overflow',
      code: `def binary_search(arr, target):
    # arr must be sorted
    low = 0
    high = len(arr) - 1

    while low <= high:
        # Avoid integer overflow in other languages like C++/Java
        mid = low + (high - low) // 2
        
        if arr[mid] == target:
            return mid  # Target found at index mid
        elif arr[mid] < target:
            low = mid + 1  # Search right half
        else:
            high = mid - 1  # Search left half
            
    return -1  # Target not found in array`,
    },
  },
  {
    id: 'cs-recursion-stack',
    title: 'Recursion & Call Stack Memory',
    subject: 'Computer Programming',
    year: '1st Year',
    category: 'cs',
    suggestedNotesPrompt: 'Recursion fundamentals: Base cases, recursive cases, stack frame allocation, stack overflow, call stack trace.',
    suggestedConcept: 'Call Stack and Stack Frames in Recursion',
    suggestedCodeSnippet: {
      language: 'cpp',
      description: 'Recursive Fibonacci with Call Stack demonstration',
      code: `#include <iostream>
using namespace std;

// Calculates the n-th Fibonacci number recursively
int fibonacci(int n) {
    // Base cases
    if (n <= 0) return 0;
    if (n == 1) return 1;

    // Recursive case: creates two stack frames
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    int n = 6;
    cout << "Fibonacci of " << n << " is: " << fibonacci(n) << endl;
    return 0;
}`,
    },
  },
  {
    id: 'cs-oop-polymorphism',
    title: 'Object-Oriented Polymorphism',
    subject: 'Object-Oriented Programming',
    year: '2nd Year',
    category: 'cs',
    suggestedNotesPrompt: 'Polymorphism in OOP: Compile-time (Method Overloading) vs Run-time (Method Overriding), virtual functions, dynamic method dispatch, vtable.',
    suggestedConcept: 'Runtime Polymorphism and Dynamic Dispatch',
    suggestedCodeSnippet: {
      language: 'java',
      description: 'Java Interface and Dynamic Method Dispatch',
      code: `// Polymorphic interface example
interface Shape {
    double calculateArea();
}

class Circle implements Shape {
    private double radius;
    public Circle(double r) { this.radius = r; }
    
    @Override
    public double calculateArea() {
        return Math.PI * radius * radius;
    }
}

class Rectangle implements Shape {
    private double width, height;
    public Rectangle(double w, double h) {
        this.width = w;
        this.height = h;
    }
    
    @Override
    public double calculateArea() {
        return width * height;
    }
}`,
    },
  },
  {
    id: 'math-eigen',
    title: 'Eigenvalues & Eigenvectors',
    subject: 'Engineering Mathematics / Linear Algebra',
    year: '1st Year',
    category: 'math',
    suggestedNotesPrompt: 'Eigenvalues and Eigenvectors: Characteristic equation det(A - lambda*I) = 0, geometric interpretation, diagonalization, Cayley-Hamilton theorem.',
    suggestedConcept: 'Geometric Intuition of Eigenvectors as Invariant Directions',
  },
  {
    id: 'math-integration-parts',
    title: 'Integration by Parts & Reduction Formulas',
    subject: 'Calculus II',
    year: '1st Year',
    category: 'math',
    suggestedNotesPrompt: 'Integration by Parts: Formula integral(u dv) = uv - integral(v du), ILATE/LIATE rule for choosing u, cyclic integrals, reduction formulas.',
    suggestedConcept: 'The Product Rule in Reverse: Why Integration by Parts Works',
  },
  {
    id: 'physics-thermo',
    title: 'First Law of Thermodynamics',
    subject: 'Engineering Physics',
    year: '1st Year',
    category: 'physics',
    suggestedNotesPrompt: 'First Law of Thermodynamics: delta U = Q - W, sign conventions, isobaric, isochoric, isothermal, and adiabatic processes, work done in expansion.',
    suggestedConcept: 'Conservation of Energy in Thermodynamic Closed Systems',
  },
  {
    id: 'electronics-kirchhoff',
    title: "Kirchhoff's Laws (KCL & KVL)",
    subject: 'Basic Electrical Engineering',
    year: '1st Year',
    category: 'electronics',
    suggestedNotesPrompt: "Kirchhoff's Current Law (KCL - Conservation of Charge) and Kirchhoff's Voltage Law (KVL - Conservation of Energy), nodal and mesh analysis.",
    suggestedConcept: "Node Voltage vs Mesh Current Analysis Intuition",
  },
  {
    id: 'cs-db-normalization',
    title: 'Database Normalization (1NF to BCNF)',
    subject: 'Database Management Systems',
    year: '2nd Year',
    category: 'cs',
    suggestedNotesPrompt: 'Database Normalization: Functional dependencies, 1NF (atomic attributes), 2NF (no partial dependency), 3NF (no transitive dependency), Boyce-Codd Normal Form (BCNF), anomaly prevention.',
    suggestedConcept: 'Transitive Functional Dependency in Relational Schemas',
    suggestedCodeSnippet: {
      language: 'sql',
      description: 'Normalized 3NF Student Enrollment Schema with Foreign Keys',
      code: `-- 3NF Normalized Table Structure
CREATE TABLE Students (
    student_id INT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE Courses (
    course_id VARCHAR(10) PRIMARY KEY,
    course_title VARCHAR(100) NOT NULL,
    credits INT CHECK (credits > 0)
);

CREATE TABLE Enrollments (
    enrollment_id INT PRIMARY KEY,
    student_id INT REFERENCES Students(student_id),
    course_id VARCHAR(10) REFERENCES Courses(course_id),
    semester VARCHAR(20) NOT NULL,
    grade CHAR(2),
    UNIQUE (student_id, course_id, semester)
);`,
    },
  },
];
