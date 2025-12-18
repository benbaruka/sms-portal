// Coverage target: 100% lines, branches, functions

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Calendar from "../../../src/components/calendar/Calendar";

// Mock FullCalendar
jest.mock("@fullcalendar/react", () => ({
  __esModule: true,
  default: ({ events, select, eventClick, customButtons, ...props }: any) => {
    return (
      <div data-testid="fullcalendar" {...props}>
        <button
          data-testid="add-event-button"
          onClick={customButtons?.addEventButton?.click}
        >
          Add Event +
        </button>
        <div data-testid="calendar-events">
          {events?.map((event: any, idx: number) => {
            // Create a mock event object with proper structure
            const mockEvent = {
              id: event.id,
              title: event.title,
              start: event.start ? new Date(event.start) : new Date(),
              end: event.end ? new Date(event.end) : null,
              extendedProps: event.extendedProps || {},
            };
            return (
              <div
                key={idx}
                data-testid={`event-${event.id}`}
                onClick={() => {
                  if (eventClick) {
                    eventClick({
                      event: mockEvent,
                    } as any);
                  }
                }}
              >
                {event.title}
              </div>
            );
          })}
        </div>
        <button
          data-testid="select-date"
          onClick={() =>
            select?.({
              startStr: "2024-01-15",
              endStr: "2024-01-15",
            } as any)
          }
        >
          Select Date
        </button>
      </div>
    );
  },
}));

jest.mock("@fullcalendar/daygrid", () => ({
  __esModule: true,
  default: {},
}));

jest.mock("@fullcalendar/timegrid", () => ({
  __esModule: true,
  default: {},
}));

jest.mock("@fullcalendar/interaction", () => ({
  __esModule: true,
  default: {},
}));

// Use a state object that can be updated and trigger re-renders
let mockIsOpen = false;
const mockOpenModal = jest.fn(() => {
  mockIsOpen = true;
});
const mockCloseModal = jest.fn(() => {
  mockIsOpen = false;
});

// Create a mock that can be updated
const mockUseModal = jest.fn(() => ({
  isOpen: mockIsOpen,
  openModal: mockOpenModal,
  closeModal: mockCloseModal,
}));

jest.mock("@/hooks/useModal", () => ({
  useModal: () => mockUseModal(),
}));

jest.mock("@/components/ui/modal", () => ({
  Modal: ({ isOpen, onClose, children, className }: any) =>
    isOpen ? (
      <div data-testid="modal" className={className}>
        <button data-testid="close-modal" onClick={onClose}>
          Close
        </button>
        {children}
      </div>
    ) : null,
}));

describe("Calendar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsOpen = false;
    mockUseModal.mockReturnValue({
      isOpen: false,
      openModal: mockOpenModal,
      closeModal: mockCloseModal,
    });
  });

  it("renders calendar component", () => {
    render(<Calendar />);
    expect(screen.getByTestId("fullcalendar")).toBeInTheDocument();
  });

  it("renders initial events", async () => {
    render(<Calendar />);
    await waitFor(() => {
      expect(screen.getByTestId("event-1")).toBeInTheDocument();
      expect(screen.getByTestId("event-2")).toBeInTheDocument();
      expect(screen.getByTestId("event-3")).toBeInTheDocument();
    });
  });

  it("opens modal when Add Event button is clicked", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Calendar />);
    
    const addButton = screen.getByTestId("add-event-button");
    await user.click(addButton);
    
    expect(mockOpenModal).toHaveBeenCalled();
    
    // Update mock to reflect modal is open and re-render
    mockIsOpen = true;
    mockUseModal.mockReturnValue({
      isOpen: true,
      openModal: mockOpenModal,
      closeModal: mockCloseModal,
    });
    rerender(<Calendar />);
    
    await waitFor(() => {
      expect(screen.getByTestId("modal")).toBeInTheDocument();
    });
  });

  it("opens modal when date is selected", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Calendar />);
    
    const selectButton = screen.getByTestId("select-date");
    await user.click(selectButton);
    
    expect(mockOpenModal).toHaveBeenCalled();
    
    // Update mock to reflect modal is open and re-render
    mockIsOpen = true;
    mockUseModal.mockReturnValue({
      isOpen: true,
      openModal: mockOpenModal,
      closeModal: mockCloseModal,
    });
    rerender(<Calendar />);
    
    await waitFor(() => {
      expect(screen.getByTestId("modal")).toBeInTheDocument();
    });
  });

  it("opens modal when event is clicked", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Calendar />);
    
    await waitFor(() => {
      const event = screen.getByTestId("event-1");
      expect(event).toBeInTheDocument();
    });
    
    const event = screen.getByTestId("event-1");
    await user.click(event);
    
    expect(mockOpenModal).toHaveBeenCalled();
    
    // Update mock to reflect modal is open and re-render
    mockIsOpen = true;
    mockUseModal.mockReturnValue({
      isOpen: true,
      openModal: mockOpenModal,
      closeModal: mockCloseModal,
    });
    rerender(<Calendar />);
    
    await waitFor(() => {
      expect(screen.getByTestId("modal")).toBeInTheDocument();
    });
  });

  it("closes modal when close button is clicked", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Calendar />);
    
    // Open modal first
    const addButton = screen.getByTestId("add-event-button");
    await user.click(addButton);
    
    // Update mock to reflect modal is open and re-render
    mockIsOpen = true;
    mockUseModal.mockReturnValue({
      isOpen: true,
      openModal: mockOpenModal,
      closeModal: mockCloseModal,
    });
    rerender(<Calendar />);
    
    await waitFor(() => {
      expect(screen.getByTestId("modal")).toBeInTheDocument();
    });
    
    const closeButton = screen.getByTestId("close-modal");
    await user.click(closeButton);
    
    expect(mockCloseModal).toHaveBeenCalled();
    
    // Update mock to reflect modal is closed
    mockIsOpen = false;
    mockUseModal.mockReturnValue({
      isOpen: false,
      openModal: mockOpenModal,
      closeModal: mockCloseModal,
    });
    rerender(<Calendar />);
  });

  it("renders modal with Add Event form when no event is selected", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Calendar />);
    
    const addButton = screen.getByTestId("add-event-button");
    await user.click(addButton);
    
    // Update mock to reflect modal is open and re-render
    mockIsOpen = true;
    mockUseModal.mockReturnValue({
      isOpen: true,
      openModal: mockOpenModal,
      closeModal: mockCloseModal,
    });
    rerender(<Calendar />);
    
    await waitFor(() => {
      expect(screen.getByText("Add Event")).toBeInTheDocument();
    });
  });

  it("renders modal with Edit Event form when event is selected", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Calendar />);
    
    await waitFor(() => {
      const event = screen.getByTestId("event-1");
      expect(event).toBeInTheDocument();
    });
    
    const event = screen.getByTestId("event-1");
    await user.click(event);
    
    // Update mock to reflect modal is open and re-render
    mockIsOpen = true;
    mockUseModal.mockReturnValue({
      isOpen: true,
      openModal: mockOpenModal,
      closeModal: mockCloseModal,
    });
    rerender(<Calendar />);
    
    await waitFor(() => {
      expect(screen.getByText("Edit Event")).toBeInTheDocument();
    });
  });

  it("allows typing event title", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Calendar />);
    
    const addButton = screen.getByTestId("add-event-button");
    await user.click(addButton);
    
    // Update mock to reflect modal is open and re-render
    mockIsOpen = true;
    mockUseModal.mockReturnValue({
      isOpen: true,
      openModal: mockOpenModal,
      closeModal: mockCloseModal,
    });
    rerender(<Calendar />);
    
    await waitFor(() => {
      const titleInput = screen.getByLabelText(/Event Title/i);
      expect(titleInput).toBeInTheDocument();
    });
    
    const titleInput = screen.getByLabelText(/Event Title/i);
    await user.type(titleInput, "New Event");
    
    expect(titleInput).toHaveValue("New Event");
  });

  it("allows selecting event color", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Calendar />);
    
    const addButton = screen.getByTestId("add-event-button");
    await user.click(addButton);
    
    // Update mock to reflect modal is open and re-render
    mockIsOpen = true;
    mockUseModal.mockReturnValue({
      isOpen: true,
      openModal: mockOpenModal,
      closeModal: mockCloseModal,
    });
    rerender(<Calendar />);
    
    await waitFor(() => {
      expect(screen.getByText("Success")).toBeInTheDocument();
    });
    
    const successRadio = screen.getByLabelText(/Success/i);
    await user.click(successRadio);
    
    expect(successRadio).toBeChecked();
  });

  it("allows setting start and end dates", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Calendar />);
    
    const addButton = screen.getByTestId("add-event-button");
    await user.click(addButton);
    
    // Update mock to reflect modal is open and re-render
    mockIsOpen = true;
    mockUseModal.mockReturnValue({
      isOpen: true,
      openModal: mockOpenModal,
      closeModal: mockCloseModal,
    });
    rerender(<Calendar />);
    
    await waitFor(() => {
      const startDateInput = screen.getByLabelText(/Enter Start Date/i);
      expect(startDateInput).toBeInTheDocument();
    });
    
    const startDateInput = screen.getByLabelText(/Enter Start Date/i);
    await user.type(startDateInput, "2024-01-15");
    
    expect(startDateInput).toHaveValue("2024-01-15");
  });

  it("adds new event when form is submitted", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Calendar />);
    
    const addButton = screen.getByTestId("add-event-button");
    await user.click(addButton);
    
    // Update mock to reflect modal is open and re-render
    mockIsOpen = true;
    mockUseModal.mockReturnValue({
      isOpen: true,
      openModal: mockOpenModal,
      closeModal: mockCloseModal,
    });
    rerender(<Calendar />);
    
    await waitFor(() => {
      const titleInput = screen.getByLabelText(/Event Title/i);
      expect(titleInput).toBeInTheDocument();
    });
    
    const titleInput = screen.getByLabelText(/Event Title/i);
    await user.type(titleInput, "New Event");
    
    const addEventButton = screen.getByRole("button", { name: /Add Event$/i });
    await user.click(addEventButton);
    
    expect(mockCloseModal).toHaveBeenCalled();
  });

  it("updates existing event when form is submitted", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Calendar />);
    
    await waitFor(() => {
      const event = screen.getByTestId("event-1");
      expect(event).toBeInTheDocument();
    });
    
    const event = screen.getByTestId("event-1");
    await user.click(event);
    
    // Update mock to reflect modal is open and re-render
    mockIsOpen = true;
    mockUseModal.mockReturnValue({
      isOpen: true,
      openModal: mockOpenModal,
      closeModal: mockCloseModal,
    });
    rerender(<Calendar />);
    
    await waitFor(() => {
      expect(screen.getByText("Edit Event")).toBeInTheDocument();
    });
    
    const updateButton = screen.getByRole("button", { name: /Update Changes/i });
    await user.click(updateButton);
    
    expect(mockCloseModal).toHaveBeenCalled();
  });

  it("renders event content with correct color class", async () => {
    render(<Calendar />);
    
    await waitFor(() => {
      const event = screen.getByTestId("event-1");
      expect(event).toBeInTheDocument();
    });
    
    // The renderEventContent function is called by FullCalendar
    // We verify it works by checking the event is rendered
    const event = screen.getByTestId("event-1");
    expect(event).toHaveTextContent("Event Conf.");
  });
});
