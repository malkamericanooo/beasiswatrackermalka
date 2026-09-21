# Graph Report - beasiswa-tracker-lengkap  (2026-09-21)

## Corpus Check
- Corpus is ~42,483 words - fits in a single context window. You may not need a graph.

## Summary
- 757 nodes · 1518 edges · 99 communities (39 shown, 60 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.89)
- Token cost: 61,089 input · 0 output

## Community Hubs (Navigation)
- Command Palette
- Sheet & Drawer Overlays
- App Shell & Routing
- Core UI Primitives
- Dashboard & Deadline Logic
- Build Output & TS Config
- Toast Notifications
- Grouped Controls
- Alert Dialog
- TypeScript Base Config
- PWA Shell & Metadata
- Scoring & Prioritisation
- Berkas Document Store
- CV Editor
- shadcn Alias Config
- Menubar
- Select & Text Inputs
- Package / Devdependencies
- Dialog & Label
- Package / Scripts
- Carousel / Carouselapi
- Item / Itemactions
- Field / Fieldcontent
- Form / Formcontrol
- Chart / Chartconfig
- Manifest / Color
- Input / Group
- Breadcrumb / Breadcrumbellipsis
- Empty / Emptycontent
- Navigation / Menu
- Toggle / Group
- Universities / Adduniversitydialog
- Alert / Alertdescription
- Input / Otp
- Accordion / Accordioncontent
- Avatar / Avatarfallback
- Api / Data
- Sonner / Toaster
- Class / Variance
- Clsx / Package
- Cmdk / Package
- Embla / Carousel
- Hookform / Resolvers
- Input / Otp
- Lucide / React
- Next / Themes
- Radix / React
- Radix / React
- Radix / React
- Radix / React
- Radix / React
- Radix / React
- Radix / React
- Radix / React
- Radix / React
- Radix / React
- Radix / React
- Radix / React
- Radix / React
- Radix / React
- Radix / React
- Radix / React
- Radix / React
- Radix / React
- Radix / React
- Radix / React
- Radix / React
- Radix / React
- Radix / React
- React / Package
- React / Day
- React / Dom
- React / Hook
- React / Icons
- React / Resizable
- Recharts / Package
- Replit / Vite
- Replit / Vite
- Replit / Vite
- Sonner / Package
- Tailwind / Merge
- Tailwindcss / Typography
- Tailwindcss / Vite
- Tanstack / React
- Tw / Animate
- Types / Node
- Types / React
- Types / React
- Typescript / Package
- Vaul / Package
- Vite / Package
- Vitejs / Plugin
- Wouter / Package
- Zod / Package
- Sw / Assets
- Env / D

## God Nodes (most connected - your core abstractions)
1. `cn()` - 295 edges
2. `compilerOptions` - 18 edges
3. `Button` - 15 edges
4. `compilerOptions` - 15 edges
5. `Dashboard()` - 14 edges
6. `getDaysLeft()` - 13 edges
7. `SidebarFooter()` - 12 edges
8. `saveToAPI()` - 12 edges
9. `getGoals()` - 12 edges
10. `Input` - 11 edges

## Surprising Connections (you probably didn't know these)
- `Service worker registration (/sw.js) with forced update` --semantically_similar_to--> `localStorage persistence layer`  [INFERRED] [semantically similar]
  index.html → README.md
- `Service worker registration (/sw.js) with forced update` --conceptually_related_to--> `Backend + database migration plan`  [AMBIGUOUS]
  index.html → README.md
- `pnpm workspace dependency catalog` --conceptually_related_to--> `Backend + database migration plan`  [AMBIGUOUS]
  pnpm-workspace.yaml → README.md
- `index.html SPA shell (#root, /src/main.tsx entry)` --implements--> `Current frontend-only stack (React 18, Vite, Tailwind, Wouter)`  [INFERRED]
  index.html → README.md
- `pnpm workspace dependency catalog` --shares_data_with--> `Current frontend-only stack (React 18, Vite, Tailwind, Wouter)`  [INFERRED]
  pnpm-workspace.yaml → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **localStorage-to-backend migration: problem, seam, mapping, stack options** — readme_per_browser_data_isolation_problem, readme_data_ts_store, readme_storage_key_to_table_mapping, readme_document_base64_storage, readme_option_a_nextjs_fullstack, readme_option_b_express_prisma [EXTRACTED 1.00]
- **Offline/installable web-app surface (shell, service worker, manifest, crawler policy)** — index_app_shell, index_service_worker_registration, index_pwa_installability, index_seo_social_metadata, public_robots_crawler_policy [INFERRED 0.85]

## Communities (99 total, 60 thin omitted)

### Community 0 - "Command Palette"
Cohesion: 0.07
Nodes (39): Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut() (+31 more)

### Community 1 - "Sheet & Drawer Overlays"
Cohesion: 0.06
Nodes (38): SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay, SheetTitle, sheetVariants (+30 more)

### Community 2 - "App Shell & Routing"
Cohesion: 0.07
Nodes (26): App(), LS_KEYS, navGroups, NavLinks(), openWidgetWindow(), queryClient, SidebarFooter(), handleCloudSync() (+18 more)

### Community 3 - "Core UI Primitives"
Cohesion: 0.09
Nodes (29): Badge(), BadgeProps, badgeVariants, Button, Card, CardContent, CardDescription, CardFooter (+21 more)

### Community 4 - "Dashboard & Deadline Logic"
Cohesion: 0.16
Nodes (25): getDaysLeft(), CalendarPage(), Dashboard(), dayLabel(), getAppStatus(), Tick(), Urgency, urgencyOf() (+17 more)

### Community 5 - "Build Output & TS Config"
Cohesion: 0.07
Nodes (26): build, dist, node_modules, src/**/*, ./tsconfig.base.json, compilerOptions, allowImportingTsExtensions, baseUrl (+18 more)

### Community 6 - "Toast Notifications"
Cohesion: 0.12
Nodes (24): Toast, ToastAction, ToastActionElement, ToastClose, ToastDescription, ToastProps, ToastTitle, toastVariants (+16 more)

### Community 7 - "Grouped Controls"
Cohesion: 0.09
Nodes (15): ButtonGroup(), ButtonGroupSeparator(), ButtonGroupText(), buttonGroupVariants, Checkbox, HoverCardContent, PopoverContent, RadioGroup (+7 more)

### Community 8 - "Alert Dialog"
Cohesion: 0.11
Nodes (20): AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter(), AlertDialogHeader(), AlertDialogOverlay, AlertDialogTitle (+12 more)

### Community 9 - "TypeScript Base Config"
Cohesion: 0.09
Nodes (21): compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module, moduleResolution (+13 more)

### Community 10 - "PWA Shell & Metadata"
Cohesion: 0.14
Nodes (21): index.html SPA shell (#root, /src/main.tsx entry), IBM Plex Sans/Mono webfont loading with preconnect, PWA installability (manifest.json, apple-mobile-web-app meta), SEO and Open Graph / Twitter card metadata, Service worker registration (/sw.js) with forced update, pnpm workspace dependency catalog, Replit Vite plugins (cartographer, dev-banner, runtime-error-modal), robots.txt allow-all crawler policy (+13 more)

### Community 11 - "Scoring & Prioritisation"
Cohesion: 0.18
Nodes (16): getCompositeScore(), sortByComposite(), sortByPriorityThenDeadline(), UnifiedCalEvent, WidgetItem, CATEGORIES, formatDeadline(), getCategoryBadgeStyle() (+8 more)

### Community 12 - "Berkas Document Store"
Cohesion: 0.19
Nodes (18): BerkasCard(), CATEGORIES, categoryColors, categoryExamples, Documents(), downloadFile(), formatBytes(), formatDate() (+10 more)

### Community 13 - "CV Editor"
Cohesion: 0.17
Nodes (13): Input, CVEditor(), CVPreviewProps, uid(), getCV(), saveCV(), CVCertificate, CVData (+5 more)

### Community 14 - "shadcn Alias Config"
Cohesion: 0.12
Nodes (16): aliases, components, hooks, lib, ui, utils, rsc, $schema (+8 more)

### Community 15 - "Menubar"
Cohesion: 0.12
Nodes (11): Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarLabel, MenubarRadioItem, MenubarSeparator, MenubarShortcut() (+3 more)

### Community 16 - "Select & Text Inputs"
Cohesion: 0.15
Nodes (14): SelectContent, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, Textarea (+6 more)

### Community 17 - "Package / Devdependencies"
Cohesion: 0.13
Nodes (15): date-fns, framer-motion, devDependencies, date-fns, framer-motion, @radix-ui/react-context-menu, @radix-ui/react-dialog, @radix-ui/react-label (+7 more)

### Community 18 - "Dialog & Label"
Cohesion: 0.21
Nodes (12): DialogContent, DialogDescription, DialogFooter(), DialogHeader(), DialogOverlay, DialogTitle, Label, labelVariants (+4 more)

### Community 19 - "Package / Scripts"
Cohesion: 0.14
Nodes (13): dependencies, @supabase/supabase-js, name, packageManager, private, scripts, build, dev (+5 more)

### Community 20 - "Carousel / Carouselapi"
Cohesion: 0.19
Nodes (13): Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext, CarouselOptions (+5 more)

### Community 21 - "Item / Itemactions"
Cohesion: 0.18
Nodes (12): Item(), ItemActions(), ItemContent(), ItemDescription(), ItemFooter(), ItemGroup(), ItemHeader(), ItemMedia() (+4 more)

### Community 22 - "Field / Fieldcontent"
Cohesion: 0.18
Nodes (11): Field(), FieldContent(), FieldDescription(), FieldError(), FieldGroup(), FieldLabel(), FieldLegend(), FieldSeparator() (+3 more)

### Community 23 - "Form / Formcontrol"
Cohesion: 0.23
Nodes (10): FormControl, FormDescription, FormFieldContext, FormFieldContextValue, FormItem, FormItemContext, FormItemContextValue, FormLabel (+2 more)

### Community 24 - "Chart / Chartconfig"
Cohesion: 0.25
Nodes (9): ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartTooltipContent, getPayloadConfigFromPayload(), THEMES (+1 more)

### Community 25 - "Manifest / Color"
Cohesion: 0.20
Nodes (9): background_color, description, display, icons, name, orientation, short_name, start_url (+1 more)

### Community 26 - "Input / Group"
Cohesion: 0.28
Nodes (8): InputGroup(), InputGroupAddon(), inputGroupAddonVariants, InputGroupButton(), inputGroupButtonVariants, InputGroupInput(), InputGroupText(), InputGroupTextarea()

### Community 27 - "Breadcrumb / Breadcrumbellipsis"
Cohesion: 0.25
Nodes (7): Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator()

### Community 28 - "Empty / Emptycontent"
Cohesion: 0.29
Nodes (7): Empty(), EmptyContent(), EmptyDescription(), EmptyHeader(), EmptyMedia(), emptyMediaVariants, EmptyTitle()

### Community 29 - "Navigation / Menu"
Cohesion: 0.29
Nodes (7): NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport

### Community 30 - "Toggle / Group"
Cohesion: 0.43
Nodes (5): ToggleGroup, ToggleGroupContext, ToggleGroupItem, Toggle, toggleVariants

### Community 31 - "Universities / Adduniversitydialog"
Cohesion: 0.43
Nodes (6): AddUniversityDialog(), addDoc(), handleClose(), handleSubmit(), reset(), genId()

### Community 32 - "Alert / Alertdescription"
Cohesion: 0.50
Nodes (4): Alert, AlertDescription, AlertTitle, alertVariants

### Community 33 - "Input / Otp"
Cohesion: 0.40
Nodes (4): InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot

### Community 34 - "Accordion / Accordioncontent"
Cohesion: 0.50
Nodes (3): AccordionContent, AccordionItem, AccordionTrigger

### Community 35 - "Avatar / Avatarfallback"
Cohesion: 0.50
Nodes (3): Avatar, AvatarFallback, AvatarImage

## Ambiguous Edges - Review These
- `Backend + database migration plan` → `Service worker registration (/sw.js) with forced update`  [AMBIGUOUS]
  index.html · relation: conceptually_related_to
- `Backend + database migration plan` → `pnpm workspace dependency catalog`  [AMBIGUOUS]
  pnpm-workspace.yaml · relation: conceptually_related_to

## Knowledge Gaps
- **206 isolated node(s):** `supabase`, `$schema`, `style`, `rsc`, `tsx` (+201 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **60 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Backend + database migration plan` and `Service worker registration (/sw.js) with forced update`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Backend + database migration plan` and `pnpm workspace dependency catalog`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `cn()` connect `Command Palette` to `Sheet & Drawer Overlays`, `App Shell & Routing`, `Core UI Primitives`, `Dashboard & Deadline Logic`, `Toast Notifications`, `Grouped Controls`, `Alert Dialog`, `Scoring & Prioritisation`, `Berkas Document Store`, `CV Editor`, `Menubar`, `Select & Text Inputs`, `Dialog & Label`, `Carousel / Carouselapi`, `Item / Itemactions`, `Field / Fieldcontent`, `Form / Formcontrol`, `Chart / Chartconfig`, `Input / Group`, `Breadcrumb / Breadcrumbellipsis`, `Empty / Emptycontent`, `Navigation / Menu`, `Toggle / Group`, `Universities / Adduniversitydialog`, `Alert / Alertdescription`, `Input / Otp`, `Accordion / Accordioncontent`, `Avatar / Avatarfallback`?**
  _High betweenness centrality (0.332) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Package / Devdependencies` to `Package / Scripts`, `Class / Variance`, `Clsx / Package`, `Cmdk / Package`, `Embla / Carousel`, `Hookform / Resolvers`, `Input / Otp`, `Lucide / React`, `Next / Themes`, `Radix / React`, `Radix / React`, `Radix / React`, `Radix / React`, `Radix / React`, `Radix / React`, `Radix / React`, `Radix / React`, `Radix / React`, `Radix / React`, `Radix / React`, `Radix / React`, `Radix / React`, `Radix / React`, `Radix / React`, `Radix / React`, `Radix / React`, `Radix / React`, `Radix / React`, `Radix / React`, `Radix / React`, `Radix / React`, `Radix / React`, `React / Package`, `React / Day`, `React / Dom`, `React / Hook`, `React / Icons`, `React / Resizable`, `Recharts / Package`, `Replit / Vite`, `Replit / Vite`, `Replit / Vite`, `Sonner / Package`, `Tailwind / Merge`, `Tailwindcss / Typography`, `Tailwindcss / Vite`, `Tanstack / React`, `Tw / Animate`, `Types / Node`, `Types / React`, `Types / React`, `Typescript / Package`, `Vaul / Package`, `Vite / Package`, `Vitejs / Plugin`, `Wouter / Package`, `Zod / Package`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Why does `SidebarFooter()` connect `App Shell & Routing` to `Command Palette`, `Toast Notifications`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **What connects `supabase`, `$schema`, `style` to the rest of the system?**
  _206 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Command Palette` be split into smaller, more focused modules?**
  _Cohesion score 0.07446808510638298 - nodes in this community are weakly interconnected._