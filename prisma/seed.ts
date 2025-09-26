import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TENANTS_DATA = [
  {
    id: 'cmg07xuar00021as72wkjf2ui',
    name: 'Demo Salon',
    slug: 'demo-salon',
    plan: 'basic',
    status: 'active',
    timeZone: 'America/La_Paz',
    leadTimeMin: 60,
    maxAdvanceDays: 60,
  },
  {
    id: 'cmg07xuat00031as7i1s7sntj',
    name: 'Demo Spa',
    slug: 'demo-spa',
    plan: 'premium',
    status: 'active',
    timeZone: 'America/New_York',
    leadTimeMin: 120,
    maxAdvanceDays: 90,
  },
  {
    id: 'ghpjimt3abg0rcpji8ghxbng',
    name: 'Demo Clinic',
    slug: 'demo-clinic',
    plan: 'enterprise',
    status: 'active',
    timeZone: 'Europe/Madrid',
    leadTimeMin: 30,
    maxAdvanceDays: 120,
  },
  {
    id: 'cmg07xuap00011as73nrihc8q',
    name: 'Demo Gym',
    slug: 'demo-gym',
    plan: 'basic',
    status: 'active',
    timeZone: 'Asia/Tokyo',
    leadTimeMin: 45,
    maxAdvanceDays: 60,
  },
];

const USERS_DATA = [
  {
    id: 'cmg07xub700091as70a41hxth',
    tenantId: 'cmg07xuar00021as72wkjf2ui',
    email: 'provider@demosalon.com',
    password: 'password123',
    firstName: 'Laura',
    lastName: 'Gomez',
    phone: '+59171234567',
    role: 'PROVIDER',
  },
  {
    id: 'cmg07xubt000f1as7pbz6j7uu',
    tenantId: 'cmg07xuar00021as72wkjf2ui',
    email: 'admin@demosalon.com',
    password: 'password123',
    firstName: 'Carlos',
    lastName: 'Lopez',
    phone: '+59179876543',
    role: 'ADMIN',
  },
  {
    id: 'cmg07xub7000b1as74gxv21xa',
    tenantId: 'cmg07xuat00031as7i1s7sntj',
    email: 'provider@demosp.com',
    password: 'password123',
    firstName: 'Marta',
    lastName: 'Fernandez',
    phone: '+59170123456',
    role: 'PROVIDER',
  },
  {
    id: 'cmg07xub7000a1as7nl0ujv9o',
    tenantId: 'cmg07xuar00021as72wkjf2ui',
    email: 'juan@demosalon.com',
    password: 'password123',
    firstName: 'Juan',
    lastName: 'Perez',
    phone: '+59160000001',
    role: 'CLIENT',
  },
  {
    id: 'cmg07xubr000d1as7i3rau1il',
    tenantId: 'cmg07xuar00021as72wkjf2ui',
    email: 'maria@demosalon.com',
    password: 'password123',
    firstName: 'Maria',
    lastName: 'Gonzalez',
    phone: '+59160000002',
    role: 'CLIENT',
  },
  {
    id: 'cmg07xuco000p1as7o8yqtnwd',
    tenantId: 'cmg07xuat00031as7i1s7sntj',
    password: 'password123',
    firstName: 'Michael',
    lastName: 'Smith',
    email: 'michael.smith@demosalon.com',
    phone: '+59160000003',
    role: 'CLIENT',
  },
  {
    id: 'cmg07xucr000t1as7jepurzka',
    tenantId: 'cmg07xuat00031as7i1s7sntj',
    password: 'password123',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@demosalon.com',
    phone: '+59160000001',
    role: 'CLIENT',
  },
  {
    id: 'cmg07xucl000m1as7psff45n8',
    tenantId: 'cmg07xuat00031as7i1s7sntj',
    password: 'password123',
    firstName: 'James',
    lastName: 'Williams',
    email: 'james.williams@demosp.com',
    phone: '+59160000002',
    role: 'CLIENT',
  },
  {
    id: 'cmg07xucr000v1as7b6nng50v',
    tenantId: 'cmg07xuat00031as7i1s7sntj',
    password: 'password123',
    firstName: 'Alice',
    lastName: 'Brown',
    email: 'alice.brown@demosp.com',
    phone: '+59160000004',
    role: 'CLIENT',
  },
  {
    id: 'cmg07xucw000x1as7xpx2nrdl',
    tenantId: 'cmg07xuat00031as7i1s7sntj',
    password: 'password123',
    firstName: 'Client',
    lastName: 'Alex Davis',
    email: 'alex.davis@demosp.com',
    phone: '+59160000005',
    role: 'CLIENT',
  },
];

const STAFF_DATA = [
  {
    id: 'cmg07xud400101as7ee31qqtm',
    tenantId: 'cmg07xuar00021as72wkjf2ui',
    name: 'Alice Fernandez',
    email: 'alice.fernandez@demosalon.com',
    phone: '+59171234567',
  },
  {
    id: 'cmg07xud400111as7q8r3ybw3',
    tenantId: 'cmg07xuar00021as72wkjf2ui',
    name: 'Carlos Ramirez',
    email: 'carlos.ramirez@demosalon.com',
    phone: '+59179876543',
  },
  {
    id: 'cmg07xud600131as7rgtyjbf9',
    tenantId: 'cmg07xuar00021as72wkjf2ui',
    name: 'Sofia Morales',
    email: 'sofia.morales@demosalon.com',
    phone: '+59170123456',
  },
  {
    id: 'cmg07xuda00151as7sv5t3vtf',
    tenantId: 'cmg07xuat00031as7i1s7sntj',
    name: 'David Sanchez',
    email: 'david.sanchez@demosp.com',
    phone: '+59171234567',
  },
  {
    id: 'cmg07xuda00171as78jl0m7gh',
    tenantId: 'cmg07xuat00031as7i1s7sntj',
    name: 'Elena Torres',
    email: 'elena.torres@demosp.com',
    phone: '+59169876543',
  },
];

const CLIENTS_DATA = [
  {
    id: 'cmg07xub700081as75go8cbyw',
    tenantId: 'cmg07xuar00021as72wkjf2ui',
    userId: 'cmg07xuco000p1as7o8yqtnwd',
    name: 'Michael Smith',
    email: 'michael.smith@demosalon.com',
    phone: '+59160000001',
    notes: 'Prefers morning appointments',
  },
  {
    id: 'cmg07xubx000h1as7w2h9ome8',
    tenantId: 'cmg07xuar00021as72wkjf2ui',
    userId: 'cmg07xucr000t1as7jepurzka',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@demosalon.com',
    phone: '+59160000002',
    notes: 'Allergic to certain products',
  },
  {
    id: 'cmg07xuby000j1as7jack828g',
    tenantId: 'cmg07xuat00031as7i1s7sntj',
    userId: 'cmg07xucl000m1as7psff45n8',
    name: 'James Williams',
    email: 'james.williams@demosp.com',
    phone: '+59160000003',
    notes: 'Interested in spa packages',
  },
  {
    id: 'cmg07xucl000n1as7i5c3kary',
    tenantId: 'cmg07xuat00031as7i1s7sntj',
    userId: 'cmg07xucr000v1as7b6nng50v',
    name: 'Alice Brown',
    email: 'alice.brown@demosp.com',
    phone: '+59160000004',
    notes: 'Prefers weekend appointments',
  },
  {
    id: 'cmg07xuco000r1as78vct6bxk',
    tenantId: 'cmg07xuap00011as73nrihc8q',
    userId: 'cmg07xucw000x1as7xpx2nrdl',
    name: 'Alex Davis',
    email: 'alex.davis@demosp.com',
    phone: '+59160000005',
    notes: 'Has a membership plan',
  },
];

const SERVICES_DATA = [
  {
    id: 'uf3b23w2h8cz6mgxnh4uio5a',
    tenantId: 'cmg07xuar00021as72wkjf2ui',
    name: 'Haircut',
    category: 'Hair',
    description: 'Professional haircut service',
    durationMin: 45,
    price: 25,
    bufferBefore: 15,
    bufferAfter: 15,
  },
  {
    id: 'hd1u69b85kjakczj3w4027io',
    tenantId: 'cmg07xuar00021as72wkjf2ui',
    name: 'Beard Trim',
    category: 'Grooming',
    description: 'Precision beard trimming service',
    durationMin: 30,
    price: 15,
    bufferBefore: 10,
    bufferAfter: 10,
  },
  {
    id: 'm1sswaiyc2kn5q91lsllrvmp',
    tenantId: 'cmg07xuar00021as72wkjf2ui',
    name: 'Relaxing Massage',
    category: 'Wellness',
    description: 'A soothing massage to relax``` your body',
    durationMin: 60,
    price: 50,
    bufferBefore: 20,
    bufferAfter: 20,
  },
  {
    id: 'u9ih6clgecm0n0q9h347q8qs',
    tenantId: 'cmg07xuat00031as7i1s7sntj',
    name: 'Hair Coloring',
    category: 'Hair',
    description: 'Professional hair coloring service',
    durationMin: 90,
    price: 70,
    bufferBefore: 30,
    bufferAfter: 30,
  },
  {
    id: 'o8jzldn6q3q2j4tjj36qe1ct',
    tenantId: 'cmg07xuat00031as7i1s7sntj',
    name: 'Facial Treatment',
    category: 'Skincare',
    description: 'Rejuvenating facial treatment service',
    durationMin: 60,
    price: 60,
  },
  {
    id: 'brnboadxhnpddtag1fn4ywpr',
    tenantId: 'cmg07xuat00031as7i1s7sntj',
    name: 'Full Body Massage',
    category: 'Wellness',
    description: 'Comprehensive full body massage service',
    durationMin: 90,
    price: 80,
  },
  {
    id: 'rbrwtwahab2mtg54nek4ovz2',
    tenantId: 'ghpjimt3abg0rcpji8ghxbng',
    name: 'General Consultation',
    category: 'Consultation',
    description: 'General consultation service',
    durationMin: 30,
    price: 40,
  },
  {
    id: 'jejnwngo9s79xj4w6my4glpj',
    tenantId: 'ghpjimt3abg0rcpji8ghxbng',
    name: 'Dental Checkup',
    category: 'Consultation',
    description: 'Routine dental checkup service',
    durationMin: 30,
    price: 40,
  },
  {
    id: 'izs3pgnvlnjxgojkd6neljc0',
    tenantId: 'ghpjimt3abg0rcpji8ghxbng',
    name: 'Physical Therapy Session',
    category: 'Consultation',
    description: 'Therapeutic physical therapy session',
    durationMin: 30,
    price: 40,
  },
  {
    id: 'wziytvn2x7mgcb71aex21sxg',
    tenantId: 'ghpjimt3abg0rcpji8ghxbng',
    name: 'Nutrition Counseling',
    category: 'Consultation',
    description: 'Personalized nutrition counseling service',
    durationMin: 30,
    price: 40,
  },
  {
    id: 'lgbpgbsbj25wjsre4fs7903e',
    tenantId: 'cmg07xuap00011as73nrihc8q',
    name: 'Personal Training Session',
    category: 'Fitness',
    description: 'One-on-one personal training session',
    durationMin: 60,
    price: 80,
  },
  {
    id: 'c90nsd03k72i684fcglwxkdd',
    tenantId: 'cmg07xuap00011as73nrihc8q',
    name: 'Yoga Class',
    category: 'Fitness',
    description: 'A relaxing yoga class for all levels',
    durationMin: 60,
    price: 20,
  },
];

const BOOKINGS_DATA = [
  {
    id: 'd331c4if65xaksv49q4mdfep',
    tenantId: 'cmg07xuar00021as72wkjf2ui',
    clientId: 'cmg07xub700081as75go8cbyw',
    providerId: 'cmg07xud400101as7ee31qqtm',
    serviceId: 'uf3b23w2h8cz6mgxnh4uio5a',
    startsAt: '2025-10-01T10:00:00-04:00',
    endsAt: '2025-10-01T10:45:00-04:00',
    status: 'CONFIRMED',
    price: 25,
    requestId: 'req_1',
  },
  {
    id: 'wpm3vrqu8nsm8qk7j2sigh69',
    tenantId: 'cmg07xuar00021as72wkjf2ui',
    clientId: 'cmg07xubx000h1as7w2h9ome8',
    providerId: 'cmg07xud400111as7q8r3ybw3',
    serviceId: 'hd1u69b85kjakczj3w4027io',
    startsAt: '2025-10-01T11:00:00-04:00',
    endsAt: '2025-10-01T11:30:00-04:00',
    status: 'APPROVED',
    price: 15,
    requestId: 'req_2',
  },
  {
    id: 'n9wis05e04frzkosfr4jtcfo',
    tenantId: 'cmg07xuar00021as72wkjf2ui',
    clientId: 'cmg07xuby000j1as7jack828g',
    providerId: 'cmg07xud400101as7ee31qqtm',
    serviceId: 'm1sswaiyc2kn5q91lsllrvmp',
    startsAt: '2025-10-01T12:00:00-04:00',
    endsAt: '2025-10-01T13:00:00-04:00',
    status: 'PENDING',
    price: 50,
    requestId: 'req_3',
  },
  {
    id: 'i5d6jah9awp0w7jq4hat08cm',
    tenantId: 'cmg07xuar00021as72wkjf2ui',
    clientId: 'cmg07xub700081as75go8cbyw',
    providerId: 'cmg07xud600131as7rgtyjbf9',
    serviceId: 'hd1u69b85kjakczj3w4027io',
    startsAt: '2025-10-02T09:00:00-04:00',
    endsAt: '2025-10-02T09:30:00-04:00',
    status: 'CONFIRMED',
    price: 15,
    requestId: 'req_4',
  },
];

const STAFF_SERVICES_DATA = [
  {
    staffId: 'cmg07xud400101as7ee31qqtm',
    serviceId: 'uf3b23w2h8cz6mgxnh4uio5a',
    tenantId: 'cmg07xuar00021as72wkjf2ui',
  },
  {
    staffId: 'cmg07xud400101as7ee31qqtm',
    serviceId: 'hd1u69b85kjakczj3w4027io',
    tenantId: 'cmg07xuar00021as72wkjf2ui',
  },
  {
    staffId: 'cmg07xud400111as7q8r3ybw3',
    serviceId: 'uf3b23w2h8cz6mgxnh4uio5a',
    tenantId: 'cmg07xuar00021as72wkjf2ui',
  },
  {
    staffId: 'cmg07xud400111as7q8r3ybw3',
    serviceId: 'hd1u69b85kjakczj3w4027io',
    tenantId: 'cmg07xuar00021as72wkjf2ui',
  },
  {
    staffId: 'cmg07xud600131as7rgtyjbf9',
    serviceId: 'uf3b23w2h8cz6mgxnh4uio5a',
    tenantId: 'cmg07xuar00021as72wkjf2ui',
  },
  {
    staffId: 'cmg07xud600131as7rgtyjbf9',
    serviceId: 'hd1u69b85kjakczj3w4027io',
    tenantId: 'cmg07xuar00021as72wkjf2ui',
  },
  {
    staffId: 'cmg07xuda00151as7sv5t3vtf',
    serviceId: 'u9ih6clgecm0n0q9h347q8qs',
    tenantId: 'cmg07xuat00031as7i1s7sntj',
  },
  {
    staffId: 'cmg07xuda00151as7sv5t3vtf',
    serviceId: 'o8jzldn6q3q2j4tjj36qe1ct',
    tenantId: 'cmg07xuat00031as7i1s7sntj',
  },
  {
    staffId: 'cmg07xuda00171as78jl0m7gh',
    serviceId: 'u9ih6clgecm0n0q9h347q8qs',
    tenantId: 'cmg07xuat00031as7i1s7sntj',
  },
  {
    staffId: 'cmg07xuda00171as78jl0m7gh',
    serviceId: 'o8jzldn6q3q2j4tjj36qe1ct',
    tenantId: 'cmg07xuat00031as7i1s7sntj',
  },
];

async function seedTenants() {
  const tenants = await Promise.all(
    TENANTS_DATA.map(async (t) => {
      const createdTenant = await prisma.tenant.create({ data: t });
      return createdTenant;
    }),
  );
  console.log('✅ Tenants seeded:', tenants.length);
  return tenants;
}

async function seedUsers() {
  const users = await Promise.all(
    USERS_DATA.map(async (u) => {
      const role = u.role as 'ADMIN' | 'PROVIDER' | 'CLIENT';
      const userForCreation = {
        id: u.id,
        tenantId: u.tenantId,
        email: u.email,
        password: u.password,
        firstName: u.firstName,
        lastName: u.lastName,
        phone: u.phone,
      };
      const user = await prisma.user.create({
        data: {
          ...userForCreation,
          roles: {
            create: {
              role: role,
            },
          },
        },
      });
      return user;
    }),
  );
  console.log('✅ Users seeded:', users.length);
  return users;
}

async function seedStaff() {
  const staff = await Promise.all(
    STAFF_DATA.map(async (s) => {
      const staff = await prisma.staff.create({
        data: {
          ...s,
        },
      });
      return staff;
    }),
  );
  console.log('✅ Staff seeded:', staff.length);
  return staff;
}

async function seedClients() {
  const clients = await Promise.all(
    CLIENTS_DATA.map(async (c) => {
      const client = await prisma.client.create({
        data: {
          ...c,
        },
      });
      return client;
    }),
  );
  console.log('✅ Clients seeded:', clients.length);
  return clients;
}

async function seedServices() {
  const services = await Promise.all(
    SERVICES_DATA.map(async (s) => {
      const service = await prisma.service.create({
        data: {
          ...s,
        },
      });
      return service;
    }),
  );
  console.log('✅ Services seeded:', services.length);
  return services;
}

async function seedStaffServices() {
  const staffServices = await Promise.all(
    STAFF_SERVICES_DATA.map(async (ss) => {
      const staffService = await prisma.staffService.create({
        data: {
          ...ss,
        },
      });
      return staffService;
    }),
  );
  console.log('✅ StaffServices seeded:', staffServices.length);
  return staffServices;
}

async function seedBookings() {
  const bookings = await Promise.all(
    BOOKINGS_DATA.map(async (b) => {
      const booking = await prisma.booking.create({
        data: {
          ...b,
          status: b.status as
            | 'PENDING'
            | 'APPROVED'
            | 'REJECTED'
            | 'CANCELLED'
            | 'SUGGESTED'
            | 'CONFIRMED'
            | 'CANCELLED_BY_CLIENT'
            | 'CANCELLED_BY_PROVIDER'
            | 'RESCHEDULED',
        },
      });
      return booking;
    }),
  );
  console.log('✅ Bookings seeded:', bookings.length);
  return bookings;
}

async function main() {
  await seedTenants();
  await seedUsers();
  await seedStaff();
  await seedClients();
  await seedServices();
  await seedStaffServices();
  await seedBookings();

  console.log('✅ Seed completo!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
