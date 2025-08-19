'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
  HomeIcon,
  DocumentTextIcon,
  CogIcon,
  ChartBarIcon,
  UserGroupIcon,
  PhotoIcon,
  SparklesIcon,
  DocumentDuplicateIcon,
  BellIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Content Generation', href: '/admin/generate', icon: SparklesIcon },
  { name: 'Posts', href: '/admin/posts', icon: DocumentTextIcon },
  { name: 'Media Library', href: '/admin/media', icon: PhotoIcon },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
  { name: 'Users', href: '/admin/users', icon: UserGroupIcon },
  { name: 'Settings', href: '/admin/settings', icon: CogIcon },
];

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                  <div className="flex h-16 shrink-0 items-center">
                    <h1 className="text-xl font-bold text-gray-900">AI Blog Admin</h1>
                  </div>
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          {navigation.map((item) => (
                            <li key={item.name}>
                              <Link
                                href={item.href}
                                className={cn(
                                  pathname === item.href
                                    ? 'bg-gray-50 text-indigo-600'
                                    : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50',
                                  'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                                )}
                                onClick={() => setOpen(false)}
                              >
                                <item.icon
                                  className={cn(
                                    pathname === item.href ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600',
                                    'h-6 w-6 shrink-0'
                                  )}
                                  aria-hidden="true"
                                />
                                {item.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </li>
                      <li className="mt-auto">
                        <div className="border-t border-gray-200 pt-4">
                          <div className="flex items-center gap-x-4 px-2 py-3 text-sm font-semibold leading-6 text-gray-900">
                            <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                              <span className="text-white font-medium">
                                {user?.username?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="sr-only">Your profile</span>
                            <span aria-hidden="true">{user?.username}</span>
                          </div>
                          <button
                            onClick={handleLogout}
                            className="group flex w-full gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                          >
                            <ArrowRightOnRectangleIcon className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-indigo-600" />
                            Sign out
                          </button>
                        </div>
                      </li>
                    </ul>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <h1 className="text-xl font-bold text-gray-900">AI Blog Admin</h1>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          pathname === item.href
                            ? 'bg-gray-50 text-indigo-600'
                            : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50',
                          'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                        )}
                      >
                        <item.icon
                          className={cn(
                            pathname === item.href ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600',
                            'h-6 w-6 shrink-0'
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="mt-auto">
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center gap-x-4 px-2 py-3 text-sm font-semibold leading-6 text-gray-900">
                    <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                      <span className="text-white font-medium">
                        {user?.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="sr-only">Your profile</span>
                    <span aria-hidden="true">{user?.username}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="group flex w-full gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                  >
                    <ArrowRightOnRectangleIcon className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-indigo-600" />
                    Sign out
                  </button>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}
