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
    homepage?: "." | (string & {
        _?: undefined;
    }) | undefined;
    bugs?: string | {
        url?: string | undefined;
        email?: string | undefined;
    } | undefined;
    license?: string | undefined;
    licenses?: {
        type?: string | undefined;
        url?: string | undefined;
    }[] | undefined;
    contributors?: import("type-fest").PackageJson.Person[] | undefined;
    maintainers?: import("type-fest").PackageJson.Person[] | undefined;
    files?: string[] | undefined;
    main?: string | undefined;
    bin?: string | {
        [binary: string]: string;
    } | undefined;
    man?: string | string[] | undefined;
    directories?: import("type-fest").PackageJson.DirectoryLocations | undefined;
    repository?: string | {
        type: string;
        url: string;
    } | undefined;
    scripts?: import("type-fest").PackageJson.Scripts | undefined;
    config?: {
        [configKey: string]: unknown;
    } | undefined;
    dependencies?: import("type-fest").PackageJson.Dependency | undefined;
    devDependencies?: import("type-fest").PackageJson.Dependency | undefined;
    optionalDependencies?: import("type-fest").PackageJson.Dependency | undefined;
    peerDependencies?: import("type-fest").PackageJson.Dependency | undefined;
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
    publishConfig?: {
        [config: string]: unknown;
    } | undefined;
    module?: string | undefined;
    esnext?: string | {
        [moduleName: string]: string | undefined;
        main?: string | undefined;
        browser?: string | undefined;
    } | undefined;
    browser?: string | {
        [moduleName: string]: string | false;
    } | undefined;
    types?: string | undefined;
    typings?: string | undefined;
    flat?: boolean | undefined;
    resolutions?: import("type-fest").PackageJson.Dependency | undefined;
    jspm?: import("type-fest").PackageJson | undefined;
    husky: any;
    prettier: any;
};
export {};
