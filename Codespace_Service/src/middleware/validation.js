export const validateCodespaceData = (req, res, next) => {
  const { name } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({
      error: "Codespace name is required",
      code: "INVALID_CODESPACE_NAME",
    });
  }

  if (name.trim().length < 2) {
    return res.status(400).json({
      error: "Codespace name must be at least 2 characters long",
      code: "CODESPACE_NAME_TOO_SHORT",
    });
  }

  if (name.trim().length > 50) {
    return res.status(400).json({
      error: "Codespace name must be less than 50 characters",
      code: "CODESPACE_NAME_TOO_LONG",
    });
  }

  req.body.name = name.trim();
  next();
};

export const validateCodespaceId = (req, res, next) => {
  const { id } = req.params;

  if (!id || !/^[0-9a-fA-F-]{36}$/.test(id)) {
    return res.status(400).json({
      error: "Invalid codespace ID format",
      code: "INVALID_CODESPACE_ID",
    });
  }

  next();
};
