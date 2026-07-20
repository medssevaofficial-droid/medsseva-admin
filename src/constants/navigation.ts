import { 
  LayoutDashboard, 
  Users, 
  TestTube, 
  PackagePlus, 
  CalendarRange, 
  ClipboardList, 
  FilePieChart, 
  FilePlus2, 
  CreditCard, 
  Ticket, 
  BellRing, 
  FileCode2, 
  Network, 
  Settings, 
  DatabaseZap,
  Activity,
  Boxes,
  MessageCircle,
  ShieldCheck,
  MapPin,
 Microscope,
  NotepadText
} from 'lucide-react';
import { UserRole } from '../types';

export interface NavItem {
  title: string;
  path: string;
  icon: any;
  roles?: UserRole[];
  moduleKey?: string; // maps to RBAC module for permission check
}

export const NAVIGATION_ITEMS: NavItem[] = [
  {
    title: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
    // no moduleKey = always visible to authenticated users
  },
  // Admin & User Mgmt
  {
    title: 'User Management',
    path: '/users',
    icon: Users,
    moduleKey: 'users',
  },
  // Medical Configurations
  {
    title: 'Test Catalog',
    path: '/tests',
    icon: TestTube,
    moduleKey: 'lab_tests',
  },
  {
    title: 'Packages',
    path: '/packages',
    icon: PackagePlus,
    moduleKey: 'packages',
  },
  // Workflow Management
{
    title: 'Bookings',
    path: '/bookings',
    icon: CalendarRange,
    moduleKey: 'bookings',
  },
  {
    title: 'Pathology Partners',
    path: '/pathology-partners',
    icon: Microscope,
    moduleKey: 'bookings',
  },
  {
    title: 'Sample Queue',
    path: '/samples',
    icon: ClipboardList,
    moduleKey: 'lab_tests',
  },
  {
    title: 'Report Approval',
    path: '/report-approval',
    icon: FilePieChart,
    moduleKey: 'reports',
  },
  {
    title: 'Report Generator',
    path: '/report-builder',
    icon: FilePlus2,
    moduleKey: 'reports',
  },
  // Operations & Business
  {
    title: 'Payments',
    path: '/payments',
    icon: CreditCard,
    moduleKey: 'payments',
  },
  {
    title: 'Coupons & Offers',
    path: '/coupons',
    icon: Ticket,
    moduleKey: 'coupons',
  },
{
    title: 'Branch Management',
    path: '/branches',
    icon: MapPin,
    moduleKey: 'franchise',
  },
  {
    title: 'Franchise Tracking',
    path: '/franchises',
    icon: Network,
    moduleKey: 'franchise',
  },
  {
    title: 'LIMS Inventory',
    path: '/inventory',
    icon: Boxes,
    moduleKey: 'inventory',
  },
  // Communications & Content
  {
    title: 'Notifications & SMS',
    path: '/notifications',
    icon: BellRing,
    moduleKey: 'notifications',
  },
  {
    title: 'CMS Management',
    path: '/cms',
    icon: FileCode2,
    moduleKey: 'cms',
  },
{
    title: 'Customer Chats',
    path: '/support',
    icon: MessageCircle,
    moduleKey: 'support',
  },
  // Analytics & Tools
  {
    title: 'Platform Analytics',
    path: '/analytics',
    icon: Activity,
    moduleKey: 'analytics',
  },
  {
    title: 'API Monitor Logs',
    path: '/logs',
    icon: DatabaseZap,
    moduleKey: 'audit_logs',
  },
  // RBAC
  {
    title: 'Roles & Permissions',
    path: '/roles',
    icon: ShieldCheck,
    moduleKey: 'roles_permissions',
  },
 // Admin User Management — Super Admin only
{
    title: 'Prescriptions',
    path: '/prescriptions',
   icon: NotepadText,
    moduleKey: 'prescriptions',
  },
  {
    title: 'Admin Users',
    path: '/admin-users',
    icon: ShieldCheck,
    roles: ['SUPER_ADMIN'],
  },
  // Settings — no moduleKey, always visible
  {
    title: 'Settings',
    path: '/settings',
    icon: Settings,
  },
];