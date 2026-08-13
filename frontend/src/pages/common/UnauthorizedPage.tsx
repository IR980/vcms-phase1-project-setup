const UnauthorizedPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-red-600">403</h1>

        <h2 className="mt-4 text-2xl font-semibold text-slate-800">
          Access Denied
        </h2>

        <p className="mt-2 text-slate-600">
          You don't have permission to access this page.
        </p>
      </div>
    </div>
  );
};

export default UnauthorizedPage;