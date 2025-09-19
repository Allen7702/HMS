'use client';

import {
  Title,
  Card,
  Group,
  Stack,
  Button,
  Badge,
  Text,
  Select,
  SimpleGrid,
  Tabs,
  Paper,
  Grid,
  RingProgress,
  Center,
  Table,
  Progress,
  Divider,
  Alert,
  NumberFormatter,
  ActionIcon,
  Tooltip
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import {
  IconCalendar,
  IconTrendingUp,
  IconTrendingDown,
  IconUsers,
  IconBed,
  IconCurrencyDollar,
  IconChartBar,
  IconFileText,
  IconDownload,
  IconPrinter,
  IconMail,
  IconChartPie,
  IconClockHour4,
  IconMapPin,
  IconPhone,
  IconCalendarEvent,
  IconAlertCircle,
  IconCheck,
  IconX
} from "@tabler/icons-react";
import React, { useState } from "react";
import { useApp } from "ui";

// Mock reports data
const mockReportsData = {
  overview: {
    totalRevenue: 2450000,
    totalBookings: 45,
    occupancyRate: 78,
    averageRate: 145000,
    totalGuests: 67,
    repeatCustomers: 12,
    cancellationRate: 8.5,
    averageStay: 2.3
  },
  monthlyRevenue: [
    { month: "Jan", revenue: 1800000, bookings: 32 },
    { month: "Feb", revenue: 2100000, bookings: 38 },
    { month: "Mar", revenue: 2450000, bookings: 45 },
    { month: "Apr", revenue: 2200000, bookings: 41 },
    { month: "May", revenue: 2650000, bookings: 48 },
    { month: "Jun", revenue: 2890000, bookings: 52 }
  ],
  roomTypePerformance: [
    { type: "Standard Single", occupancy: 85, revenue: 640000, avgRate: 80000 },
    { type: "Standard Double", occupancy: 92, revenue: 1080000, avgRate: 120000 },
    { type: "Deluxe Single", occupancy: 75, revenue: 750000, avgRate: 100000 },
    { type: "Deluxe Double", occupancy: 68, revenue: 1020000, avgRate: 150000 },
    { type: "Suite", occupancy: 60, revenue: 1500000, avgRate: 250000 }
  ],
  guestAnalytics: {
    nationality: [
      { country: "Tanzania", guests: 28, percentage: 42 },
      { country: "Kenya", guests: 15, percentage: 22 },
      { country: "Uganda", guests: 8, percentage: 12 },
      { country: "Rwanda", guests: 6, percentage: 9 },
      { country: "Others", guests: 10, percentage: 15 }
    ],
    bookingSource: [
      { source: "Direct", bookings: 18, percentage: 40 },
      { source: "Booking.com", bookings: 12, percentage: 27 },
      { source: "Expedia", bookings: 6, percentage: 13 },
      { source: "Phone", bookings: 5, percentage: 11 },
      { source: "Others", bookings: 4, percentage: 9 }
    ]
  },
  housekeepingReport: {
    totalRoomsServiced: 156,
    averageCleaningTime: 45,
    maintenanceRequests: 8,
    cleaningSupplyCost: 125000,
    staffProductivity: 92
  },
  financialSummary: {
    grossRevenue: 2450000,
    operatingCosts: 980000,
    netProfit: 1470000,
    profitMargin: 60,
    averageDailyRate: 145000,
    revenuePerAvailableRoom: 113000
  }
};

const reportTypes = [
  "Revenue Report",
  "Occupancy Report", 
  "Guest Analytics",
  "Room Performance",
  "Housekeeping Report",
  "Financial Summary",
  "Booking Sources",
  "Cancellation Report"
];

const timeRanges = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "quarter", label: "This Quarter" },
  { value: "year", label: "This Year" },
  { value: "custom", label: "Custom Range" }
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("month");
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState("");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sw-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getPerformanceColor = (value: number, threshold = 70) => {
    if (value >= threshold + 15) return 'green';
    if (value >= threshold) return 'yellow';
    return 'red';
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <IconTrendingUp size={16} color="green" />;
    if (current < previous) return <IconTrendingDown size={16} color="red" />;
    return <IconTrendingUp size={16} color="gray" />;
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <Title order={1}>Reports & Analytics</Title>
        <Group>
          <Select
            placeholder="Select Report Type"
            data={reportTypes}
            value={selectedReport}
            onChange={(value) => setSelectedReport(value || "")}
            w={200}
          />
          <Button
            variant="light"
            leftSection={<IconDownload size={16} />}
          >
            Export
          </Button>
        </Group>
      </Group>

      {/* Date Range Selector */}
      <Card withBorder>
        <Group>
          <Select
            label="Time Period"
            data={timeRanges}
            value={timeRange}
            onChange={(value) => setTimeRange(value || "month")}
            w={150}
          />
          {timeRange === 'custom' && (
            <Group>
              <DatePickerInput
                label="Start Date"
                placeholder="Select start date"
                value={startDate}
                onChange={setStartDate}
                w={150}
              />
              <DatePickerInput
                label="End Date"
                placeholder="Select end date"
                value={endDate}
                onChange={setEndDate}
                w={150}
              />
            </Group>
          )}
          <Button variant="light" mt={25}>
            Apply Filter
          </Button>
        </Group>
      </Card>

      {/* Key Performance Indicators */}
      <SimpleGrid cols={{ base: 2, sm: 4 }}>
        <Card withBorder>
          <Group justify="space-between" mb="xs">
            <Text size="sm" c="dimmed">Total Revenue</Text>
            {getTrendIcon(2450000, 2200000)}
          </Group>
          <Text size="xl" fw={700}>{formatCurrency(mockReportsData.overview.totalRevenue)}</Text>
          <Text size="xs" c="green">+11.4% from last month</Text>
        </Card>

        <Card withBorder>
          <Group justify="space-between" mb="xs">
            <Text size="sm" c="dimmed">Occupancy Rate</Text>
            <IconBed size={20} color="blue" />
          </Group>
          <Group align="end" gap="xs">
            <Text size="xl" fw={700}>{mockReportsData.overview.occupancyRate}%</Text>
            <RingProgress
              size={40}
              thickness={4}
              sections={[{ value: mockReportsData.overview.occupancyRate, color: 'blue' }]}
            />
          </Group>
          <Text size="xs" c="blue">+5.2% from last month</Text>
        </Card>

        <Card withBorder>
          <Group justify="space-between" mb="xs">
            <Text size="sm" c="dimmed">Total Bookings</Text>
            <IconCalendarEvent size={20} color="orange" />
          </Group>
          <Text size="xl" fw={700}>{mockReportsData.overview.totalBookings}</Text>
          <Text size="xs" c="orange">+8 from last month</Text>
        </Card>

        <Card withBorder>
          <Group justify="space-between" mb="xs">
            <Text size="sm" c="dimmed">Average Rate</Text>
            <IconCurrencyDollar size={20} color="green" />
          </Group>
          <Text size="xl" fw={700}>{formatCurrency(mockReportsData.overview.averageRate)}</Text>
          <Text size="xs" c="green">+2.8% from last month</Text>
        </Card>
      </SimpleGrid>

      {/* Reports Tabs */}
      <Tabs value={activeTab} onChange={(value) => setActiveTab(value || "overview")}>
        <Tabs.List>
          <Tabs.Tab value="overview" leftSection={<IconChartBar size={16} />}>
            Overview
          </Tabs.Tab>
          <Tabs.Tab value="revenue" leftSection={<IconCurrencyDollar size={16} />}>
            Revenue
          </Tabs.Tab>
          <Tabs.Tab value="occupancy" leftSection={<IconBed size={16} />}>
            Occupancy
          </Tabs.Tab>
          <Tabs.Tab value="guests" leftSection={<IconUsers size={16} />}>
            Guests
          </Tabs.Tab>
          <Tabs.Tab value="operations" leftSection={<IconClockHour4 size={16} />}>
            Operations
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview" pt="md">
          <Grid>
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Card withBorder>
                <Stack gap="md">
                  <Group justify="space-between">
                    <Text fw={500} size="lg">Revenue Trend</Text>
                    <Badge variant="light" color="blue">Last 6 Months</Badge>
                  </Group>
                  
                  {/* Simple Revenue Chart Visualization */}
                  <Stack gap="xs">
                    {mockReportsData.monthlyRevenue.map((month) => (
                      <Group key={month.month} justify="space-between">
                        <Text size="sm" w={50}>{month.month}</Text>
                        <Progress
                          value={(month.revenue / 3000000) * 100}
                          size="lg"
                          flex={1}
                          mx="md"
                        />
                        <Text size="sm" w={100} ta="right">
                          {formatCurrency(month.revenue)}
                        </Text>
                      </Group>
                    ))}
                  </Stack>
                </Stack>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }}>
              <Stack>
                <Card withBorder>
                  <Stack gap="xs">
                    <Text fw={500}>Quick Stats</Text>
                    <Divider />
                    <Group justify="space-between">
                      <Text size="sm">Total Guests</Text>
                      <Text size="sm" fw={500}>{mockReportsData.overview.totalGuests}</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="sm">Repeat Customers</Text>
                      <Text size="sm" fw={500}>{mockReportsData.overview.repeatCustomers}</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="sm">Cancellation Rate</Text>
                      <Text size="sm" fw={500}>{mockReportsData.overview.cancellationRate}%</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="sm">Average Stay</Text>
                      <Text size="sm" fw={500}>{mockReportsData.overview.averageStay} nights</Text>
                    </Group>
                  </Stack>
                </Card>

                <Card withBorder>
                  <Stack gap="xs">
                    <Text fw={500}>Performance Alerts</Text>
                    <Divider />
                    <Alert icon={<IconAlertCircle size={16} />} color="yellow">
                      <Text size="sm">Suite occupancy below target</Text>
                    </Alert>
                    <Alert icon={<IconCheck size={16} />} color="green">
                      <Text size="sm">Revenue goal exceeded</Text>
                    </Alert>
                  </Stack>
                </Card>
              </Stack>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value="revenue" pt="md">
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card withBorder>
                <Stack gap="md">
                  <Text fw={500} size="lg">Revenue by Room Type</Text>
                  <Table>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Room Type</Table.Th>
                        <Table.Th>Revenue</Table.Th>
                        <Table.Th>Avg Rate</Table.Th>
                        <Table.Th>Performance</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {mockReportsData.roomTypePerformance.map((room) => (
                        <Table.Tr key={room.type}>
                          <Table.Td>{room.type}</Table.Td>
                          <Table.Td>{formatCurrency(room.revenue)}</Table.Td>
                          <Table.Td>{formatCurrency(room.avgRate)}</Table.Td>
                          <Table.Td>
                            <Badge color={getPerformanceColor(room.occupancy)} size="sm">
                              {room.occupancy}%
                            </Badge>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Stack>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card withBorder>
                <Stack gap="md">
                  <Text fw={500} size="lg">Financial Summary</Text>
                  <SimpleGrid cols={2}>
                    <Paper p="md" withBorder>
                      <Stack gap="xs">
                        <Text size="sm" c="dimmed">Gross Revenue</Text>
                        <Text size="lg" fw={700}>
                          {formatCurrency(mockReportsData.financialSummary.grossRevenue)}
                        </Text>
                      </Stack>
                    </Paper>
                    <Paper p="md" withBorder>
                      <Stack gap="xs">
                        <Text size="sm" c="dimmed">Operating Costs</Text>
                        <Text size="lg" fw={700} c="red">
                          {formatCurrency(mockReportsData.financialSummary.operatingCosts)}
                        </Text>
                      </Stack>
                    </Paper>
                    <Paper p="md" withBorder>
                      <Stack gap="xs">
                        <Text size="sm" c="dimmed">Net Profit</Text>
                        <Text size="lg" fw={700} c="green">
                          {formatCurrency(mockReportsData.financialSummary.netProfit)}
                        </Text>
                      </Stack>
                    </Paper>
                    <Paper p="md" withBorder>
                      <Stack gap="xs">
                        <Text size="sm" c="dimmed">Profit Margin</Text>
                        <Group align="center" gap="xs">
                          <RingProgress
                            size={40}
                            thickness={4}
                            sections={[{ value: mockReportsData.financialSummary.profitMargin, color: 'green' }]}
                          />
                          <Text size="lg" fw={700}>
                            {mockReportsData.financialSummary.profitMargin}%
                          </Text>
                        </Group>
                      </Stack>
                    </Paper>
                  </SimpleGrid>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value="occupancy" pt="md">
          <Card withBorder>
            <Stack gap="md">
              <Text fw={500} size="lg">Room Type Occupancy Analysis</Text>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Room Type</Table.Th>
                    <Table.Th>Occupancy Rate</Table.Th>
                    <Table.Th>Available Rooms</Table.Th>
                    <Table.Th>Total Revenue</Table.Th>
                    <Table.Th>Performance</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {mockReportsData.roomTypePerformance.map((room) => (
                    <Table.Tr key={room.type}>
                      <Table.Td>
                        <Text fw={500}>{room.type}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Group align="center" gap="md">
                          <Progress value={room.occupancy} w={100} />
                          <Text size="sm" fw={500}>{room.occupancy}%</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">
                          {Math.round((100 - room.occupancy) / 100 * 6)} / 6
                        </Text>
                      </Table.Td>
                      <Table.Td>{formatCurrency(room.revenue)}</Table.Td>
                      <Table.Td>
                        <Badge 
                          color={getPerformanceColor(room.occupancy)} 
                          variant="filled"
                        >
                          {room.occupancy >= 85 ? 'Excellent' : 
                           room.occupancy >= 70 ? 'Good' : 'Needs Attention'}
                        </Badge>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Stack>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="guests" pt="md">
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card withBorder>
                <Stack gap="md">
                  <Text fw={500} size="lg">Guest Demographics</Text>
                  <Stack gap="xs">
                    {mockReportsData.guestAnalytics.nationality.map((item) => (
                      <Group key={item.country} justify="space-between">
                        <Group>
                          <Text size="sm" w={80}>{item.country}</Text>
                          <Progress 
                            value={item.percentage} 
                            w={120}
                            size="sm"
                          />
                        </Group>
                        <Text size="sm" fw={500}>
                          {item.guests} ({item.percentage}%)
                        </Text>
                      </Group>
                    ))}
                  </Stack>
                </Stack>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card withBorder>
                <Stack gap="md">
                  <Text fw={500} size="lg">Booking Sources</Text>
                  <Stack gap="xs">
                    {mockReportsData.guestAnalytics.bookingSource.map((item) => (
                      <Group key={item.source} justify="space-between">
                        <Group>
                          <Text size="sm" w={100}>{item.source}</Text>
                          <Progress 
                            value={item.percentage} 
                            w={120}
                            size="sm"
                            color={item.source === 'Direct' ? 'green' : 'blue'}
                          />
                        </Group>
                        <Text size="sm" fw={500}>
                          {item.bookings} ({item.percentage}%)
                        </Text>
                      </Group>
                    ))}
                  </Stack>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value="operations" pt="md">
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card withBorder>
                <Stack gap="md">
                  <Text fw={500} size="lg">Housekeeping Performance</Text>
                  <SimpleGrid cols={2}>
                    <Paper p="sm" withBorder>
                      <Stack gap="xs" align="center">
                        <Text size="sm" c="dimmed">Rooms Serviced</Text>
                        <Text size="xl" fw={700}>
                          {mockReportsData.housekeepingReport.totalRoomsServiced}
                        </Text>
                      </Stack>
                    </Paper>
                    <Paper p="sm" withBorder>
                      <Stack gap="xs" align="center">
                        <Text size="sm" c="dimmed">Avg Clean Time</Text>
                        <Text size="xl" fw={700}>
                          {mockReportsData.housekeepingReport.averageCleaningTime}min
                        </Text>
                      </Stack>
                    </Paper>
                    <Paper p="sm" withBorder>
                      <Stack gap="xs" align="center">
                        <Text size="sm" c="dimmed">Maintenance Requests</Text>
                        <Text size="xl" fw={700} c="orange">
                          {mockReportsData.housekeepingReport.maintenanceRequests}
                        </Text>
                      </Stack>
                    </Paper>
                    <Paper p="sm" withBorder>
                      <Stack gap="xs" align="center">
                        <Text size="sm" c="dimmed">Staff Productivity</Text>
                        <Group align="center" gap="xs">
                          <RingProgress
                            size={40}
                            thickness={4}
                            sections={[{ 
                              value: mockReportsData.housekeepingReport.staffProductivity, 
                              color: 'green' 
                            }]}
                          />
                          <Text size="lg" fw={700}>
                            {mockReportsData.housekeepingReport.staffProductivity}%
                          </Text>
                        </Group>
                      </Stack>
                    </Paper>
                  </SimpleGrid>
                </Stack>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card withBorder>
                <Stack gap="md">
                  <Text fw={500} size="lg">Operational Metrics</Text>
                  <Stack gap="md">
                    <Group justify="space-between">
                      <Text size="sm">Supply Costs (Monthly)</Text>
                      <Text size="sm" fw={500}>
                        {formatCurrency(mockReportsData.housekeepingReport.cleaningSupplyCost)}
                      </Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="sm">Average Daily Rate</Text>
                      <Text size="sm" fw={500}>
                        {formatCurrency(mockReportsData.financialSummary.averageDailyRate)}
                      </Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="sm">Revenue per Available Room</Text>
                      <Text size="sm" fw={500}>
                        {formatCurrency(mockReportsData.financialSummary.revenuePerAvailableRoom)}
                      </Text>
                    </Group>
                    
                    <Alert icon={<IconAlertCircle size={16} />} color="blue">
                      <Text size="sm">
                        Consider optimizing housekeeping schedules during peak hours to improve efficiency.
                      </Text>
                    </Alert>
                  </Stack>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>
      </Tabs>

      {/* Export Actions */}
      <Card withBorder>
        <Group justify="space-between">
          <Text fw={500}>Export Options</Text>
          <Group>
            <Tooltip label="Download PDF Report">
              <ActionIcon variant="light" color="red">
                <IconFileText size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Print Report">
              <ActionIcon variant="light" color="blue">
                <IconPrinter size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Email Report">
              <ActionIcon variant="light" color="green">
                <IconMail size={16} />
              </ActionIcon>
            </Tooltip>
            <Button variant="light" leftSection={<IconDownload size={16} />}>
              Export to Excel
            </Button>
          </Group>
        </Group>
      </Card>
    </Stack>
  );
}
