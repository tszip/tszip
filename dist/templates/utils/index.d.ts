import { Template } from '../template';
interface ProjectArgs {
    name: string;
    author: string;
}
export declare const composePackageJson: (template: Template) => ({ name, author, }: ProjectArgs) => {
    name: string;
    author: string;
    'size-limit': {
        path: string;
        limit: string;
    }[];
    version?: string | undefined;
    description?: string | undefined;
    keywords?: string[] | undefined;
    homepage?: import("type-fest").LiteralUnion<".", string> | undefined;
    bugs?: import("type-fest").PackageJson.BugsLocation | undefined;
    license?: string | undefined;
    licenses?: {
        type?: string | undefined;
        url?: string | undefined;
    }[] | undefined;
    contributors?: import("type-fest").PackageJson.Person[] | undefined;
    maintainers?: import("type-fest").PackageJson.Person[] | undefined;
    files?: string[] | undefined;
    type?: "module" | "commonjs" | undefined;
    main?: string | undefined;
    exports?: import("type-fest").PackageJson.Exports | undefined;
    bin?: string | Record<string, string> | undefined;
    man?: string | string[] | undefined;
    directories?: import("type-fest").PackageJson.DirectoryLocations | undefined;
    repository?: string | {
        type: string;
        url: string;
        directory?: string | undefined;
    } | undefined;
    scripts?: import("type-fest").PackageJson.Scripts | undefined;
    config?: Record<string, unknown> | undefined;
    dependencies?: import("type-fest").PackageJson.Dependency | undefined;
    devDependencies?: import("type-fest").PackageJson.Dependency | undefined;
    optionalDependencies?: import("type-fest").PackageJson.Dependency | undefined;
    peerDependencies?: import("type-fest").PackageJson.Dependency | undefined;
    peerDependenciesMeta?: Record<string, {
        optional: true;
    }> | undefined;
    bundledDependencies?: string[] | undefined;
    bundleDependencies?: string[] | undefined;
    engines?: {
        [x: string]: string;
    } | undefined;
    engineStrict?: boolean | undefined;
    os?: import("type-fest").LiteralUnion<"aix" | "darwin" | "freebsd" | "linux" | "openbsd" | "sunos" | "win32" | "!aix" | "!darwin" | "!freebsd" | "!linux" | "!openbsd" | "!sunos" | "!win32", string>[] | undefined;
    cpu?: import("type-fest").LiteralUnion<"arm" | "arm64" | "ia32" | "mips" | "mipsel" | "ppc" | "ppc64" | "s390" | "s390x" | "x32" | "x64" | "!arm" | "!arm64" | "!ia32" | "!mips" | "!mipsel" | "!ppc" | "!ppc64" | "!s390" | "!s390x" | "!x32" | "!x64", string>[] | undefined;
    preferGlobal?: boolean | undefined;
    private?: boolean | undefined;
    publishConfig?: Record<string, unknown> | undefined;
    funding?: string | {
        type?: import("type-fest").LiteralUnion<"github" | "opencollective" | "patreon" | "individual" | "foundation" | "corporation", string> | undefined;
        url: string;
    } | undefined;
    module?: string | undefined;
    esnext?: string | {
        [moduleName: string]: string | undefined;
        main?: string | undefined;
        browser?: string | undefined;
    } | undefined;
    browser?: string | Record<string, string | false> | undefined;
    sideEffects?: boolean | string[] | undefined;
    types?: string | undefined;
    typings?: string | undefined;
    workspaces?: string[] | import("type-fest").PackageJson.WorkspaceConfig | undefined;
    flat?: boolean | undefined;
    resolutions?: import("type-fest").PackageJson.Dependency | undefined;
    jspm?: import("type-fest").PackageJson | undefined;
    husky: any;
    prettier: any;
};
export {};
